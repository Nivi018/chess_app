import { lazy, useState } from 'react'
import { lessons } from '../../content/lessons'
import { reviewExercises } from '../../content/review-exercises'
import { LazyProgressDashboard } from './components/lazy-progress-dashboard'
import { createInitialProgress, loadProgress, type LessonProgress } from '../../domain/lesson'
import type { AcademyProgress, ActivityTarget } from '../../domain/academy-progress'
import type { StorageState } from '../lesson/hooks/use-lesson'
import { tactics } from '../../content/tactics'
import { FeatureBoundary } from '../../components/ui/feature-boundary'

const TacticsPage = lazy(() => import('./components/tactics-page').then((module) => ({ default: module.TacticsPage })))
const LessonPage = lazy(() => import('../lesson/components/lesson-page').then((module) => ({ default: module.LessonPage })))
const ComputerPage = lazy(() => import('../play/components/computer-page').then((module) => ({ default: module.ComputerPage })))

function readAcademyProgress() {
  const progress: AcademyProgress = {}
  let storageUnavailable = false
  for (const activity of [...lessons, ...reviewExercises, ...tactics]) {
    try {
      progress[activity.id] = loadProgress(window.localStorage, activity.id)
    } catch {
      progress[activity.id] = createInitialProgress(activity.id)
      storageUnavailable = true
    }
  }
  // loadProgress safely handles read failures; probe separately to report blocked storage.
  try { window.localStorage.getItem('chess-academy:storage-check') } catch { storageUnavailable = true }
  return { progress, readUnavailable: storageUnavailable, unsavedIds: [] as string[] }
}

export function Academy() {
  const [mode, setMode] = useState<'lessons' | 'review' | 'tactics' | 'computer'>('lessons')
  const [session, setSession] = useState(readAcademyProgress)
  const [showProgress, setShowProgress] = useState(false)
  const [launch, setLaunch] = useState<{ target?: ActivityTarget; version: number }>({ version: 0 })
  const storageUnavailable = session.readUnavailable || session.unsavedIds.length > 0
  const reviewMode = mode === 'review'

  function openActivity(target: ActivityTarget) {
    setMode(target.mode)
    setLaunch((current) => ({ target, version: current.version + 1 }))
    setShowProgress(false)
  }

  function recordProgress(progress: LessonProgress, state: StorageState) {
    setSession((current) => ({
      ...current,
      progress: { ...current.progress, [progress.lessonId]: progress },
      unsavedIds: state === 'saved'
        ? current.unsavedIds.filter((id) => id !== progress.lessonId)
        : [...new Set([...current.unsavedIds, progress.lessonId])],
    }))
  }

  function switchSection(next: typeof mode) {
    setMode(next)
    setShowProgress(false)
    setLaunch((current) => ({ version: current.version + 1 }))
  }

  return mode === 'computer' ? (
    <FeatureBoundary key={`computer:${launch.version}`} label="la partida contra el ordenador" onBack={() => switchSection('lessons')}>
      <ComputerPage progress={session.progress} storageUnavailable={storageUnavailable} onOpenActivity={openActivity}
        onShowLessons={() => switchSection('lessons')} onShowReviews={() => switchSection('review')} onShowTactics={() => switchSection('tactics')} />
    </FeatureBoundary>
  ) : mode === 'tactics' ? (
    <FeatureBoundary key={`tactics:${launch.version}`} label="las tácticas" onBack={() => { setMode('lessons'); setLaunch((current) => ({ version: current.version + 1 })) }}>
    <TacticsPage
      key={`tactics:${launch.version}`}
      progress={session.progress}
      storageUnavailable={storageUnavailable}
      initialActivityId={launch.target?.mode === 'tactics' ? launch.target.activityId : undefined}
      initialReplay={launch.target?.mode === 'tactics' && launch.target.replay}
      onProgressChange={recordProgress}
      onOpenActivity={openActivity}
      onShowLessons={() => { setMode('lessons'); setLaunch((current) => ({ version: current.version + 1 })) }}
      onShowReviews={() => { setMode('review'); setLaunch((current) => ({ version: current.version + 1 })) }}
      onShowComputer={() => switchSection('computer')}
    />
    </FeatureBoundary>
  ) : (
    <FeatureBoundary key={`course:${launch.version}`} label={reviewMode ? 'los repasos' : 'las lecciones'}>
    <LessonPage
      key={`${reviewMode ? 'review' : 'lessons'}:${launch.version}`}
      catalog={reviewMode ? reviewExercises : lessons}
      reviewMode={reviewMode}
      initialActivityId={launch.target?.activityId}
      initialReplay={launch.target?.replay}
      initialProgress={session.progress}
      storageUnavailable={storageUnavailable}
      onProgressChange={recordProgress}
      onShowProgress={() => setShowProgress((current) => !current)}
      onSwitchComputer={() => switchSection('computer')}
      onSwitchTactics={() => {
        setMode('tactics')
        setLaunch((current) => ({ version: current.version + 1 }))
        setShowProgress(false)
      }}
      progressContent={showProgress ? <LazyProgressDashboard progress={session.progress} storageUnavailable={storageUnavailable} onOpen={openActivity} onBack={() => setShowProgress(false)} /> : undefined}
      onSwitchMode={() => {
        setMode((current) => current === 'review' ? 'lessons' : 'review')
        setLaunch((current) => ({ version: current.version + 1 }))
        setShowProgress(false)
      }}
    />
    </FeatureBoundary>
  )
}
