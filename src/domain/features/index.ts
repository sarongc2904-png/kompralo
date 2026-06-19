export type {
  FeatureStatus,
  FeatureCategory,
  FeatureDescriptor,
} from '@/domain/features/types';

export {
  featureRegistry,
  featureRegistryById,
  activeFeatures,
  comingSoonFeatures,
  getFeaturesForPlanFromRegistry,
  getActiveFeaturesForPlan,
  getComingSoonFeatures,
} from '@/domain/features/registry';
