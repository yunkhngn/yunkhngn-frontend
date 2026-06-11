// Lazily loads framer-motion's feature pack so the full animation runtime
// stays out of the shared first-load bundle. domMax (not domAnimation)
// because Navbar's hover pill uses layoutId, which needs layout animations.
export const loadMotionFeatures = () =>
  import('./motionFeaturesMax').then((mod) => mod.default);
