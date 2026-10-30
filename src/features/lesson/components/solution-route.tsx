import { solveExercise, type MoveExercise } from '../../../domain/lesson'
import { MoveRoute } from './move-route'

export function SolutionRoute({ exercise }: { exercise: MoveExercise }) {
  const { rookRoute } = solveExercise(exercise)
  return <>
    <MoveRoute from={exercise.targetFrom} to={exercise.targetTo} />
    {rookRoute && <MoveRoute from={rookRoute.from} to={rookRoute.to} />}
  </>
}
