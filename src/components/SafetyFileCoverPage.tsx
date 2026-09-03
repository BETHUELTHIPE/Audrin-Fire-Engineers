import React from 'react';
import { SafetyFileCover, SafetyFileCoverProps } from './SafetyFileCover';

export type { SafetyFileCoverProps };
export { SafetyFileCover };

/**
 * SafetyFileCoverPage is an alias and wrapper around SafetyFileCover,
 * maintaining backwards compatibility with any existing imports.
 */
export const SafetyFileCoverPage: React.FC<SafetyFileCoverProps> = (props) => {
  return <SafetyFileCover {...props} />;
};
