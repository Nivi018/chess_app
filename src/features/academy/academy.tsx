import { useState } from 'react'
import { lessons } from '../../content/lessons'
import { reviewExercises } from '../../content/review-exercises'
import { LessonPage } from '../lesson/components/lesson-page'

export function Academy() {
  const [reviewMode, setReviewMode] = useState(false)
  return (
    <LessonPage
      key={reviewMode ? 'review' : 'lessons'}
      catalog={reviewMode ? reviewExercises : lessons}
      reviewMode={reviewMode}
      onSwitchMode={() => setReviewMode((current) => !current)}
    />
  )
}
