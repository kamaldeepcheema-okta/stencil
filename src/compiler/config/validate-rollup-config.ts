import type * as d from '../../declarations';
import { isObject, pluck } from '@utils';

export const validateRollupConfig = (config: d.UnvalidatedConfig): void => {
  const cleanRollupConfig = getCleanRollupConfig(config.rollupConfig);
  config.rollupConfig = cleanRollupConfig;
};

const getCleanRollupConfig = (rollupConfig: d.Config['rollupConfig']): d.RollupConfig => {
  let cleanRollupConfig = DEFAULT_ROLLUP_CONFIG;

  if (!rollupConfig || !isObject(rollupConfig)) {
    return cleanRollupConfig;
  }

  if (rollupConfig.inputOptions && isObject(rollupConfig.inputOptions)) {
    cleanRollupConfig = {
      ...cleanRollupConfig,
      inputOptions: pluck(rollupConfig.inputOptions, ['context', 'moduleContext', 'treeshake']),
    };
  }

  if (rollupConfig.outputOptions && isObject(rollupConfig.outputOptions)) {
    cleanRollupConfig = {
      ...cleanRollupConfig,
      outputOptions: pluck(rollupConfig.outputOptions, ['globals']),
    };
  }

  return cleanRollupConfig;
};

const DEFAULT_ROLLUP_CONFIG: d.RollupConfig = {
  inputOptions: {},
  outputOptions: {},
};
