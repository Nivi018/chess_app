import { lazy } from 'react'
import { FeatureBoundary } from '../../../components/ui/feature-boundary'
import type { ProgressDashboardProps } from './progress-dashboard'

const ProgressDashboard = lazy(() => import('./progress-dashboard').then((module) => ({ default: module.ProgressDashboard })))

export function LazyProgressDashboard(props: ProgressDashboardProps) {
  return <FeatureBoundary label="Mi avance" onBack={props.onBack}><ProgressDashboard {...props} /></FeatureBoundary>
}
