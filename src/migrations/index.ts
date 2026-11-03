import * as migration_20261103_040758_initial from './20261103_040758_initial';
import * as migration_20261103_050000_enable_rls from './20261103_050000_enable_rls';

export const migrations = [
  {
    up: migration_20261103_040758_initial.up,
    down: migration_20261103_040758_initial.down,
    name: '20261103_040758_initial'
  },
  {
    up: migration_20261103_050000_enable_rls.up,
    down: migration_20261103_050000_enable_rls.down,
    name: '20261103_050000_enable_rls'
  },
];
