import { useState } from 'react'
import { lessons } from '../../content/lessons'
import { reviewExercises } from '../../content/review-exercises'
import { LessonPage } from '../lesson/components/lesson-page'
import { ProgressDashboard } from './components/progress-dashboard'
import { createInitialProgress, loadProgress, type LessonProgress } from '../../domain/lesson'
import type { AcademyProgress, ActivityTarget } from '../../domain/academy-progress'
import type { StorageState } from '../lesson/hooks/use-lesson'

function readAcademyProgress() {
  const progress: AcademyProgress = {}
  let storageUnavailable = false
  for (const activity of [...lessons, ...reviewExercises]) {
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
  const [reviewMode, setReviewMode] = useState(false)
  const [session, setSession] = useState(readAcademyProgress)
  const [showProgress, setShowProgress] = useState(false)
  const [launch, setLaunch] = useState<{ target?: ActivityTarget; version: number }>({ version: 0 })
  const storageUnavailable = session.readUnavailable || session.unsavedIds.length > 0

  function openActivity(target: ActivityTarget) {
    setReviewMode(target.mode === 'review')
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

  return (
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
      progressContent={showProgress ? <ProgressDashboard progress={session.progress} storageUnavailable={storageUnavailable} onOpen={openActivity} onBack={() => setShowProgress(false)} /> : undefined}
      onSwitchMode={() => {
        setReviewMode((current) => !current)
        setLaunch((current) => ({ version: current.version + 1 }))
        setShowProgress(false)
      }}
    />
  )
}
