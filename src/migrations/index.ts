import * as migration_20261103_040758_initial from './20261103_040758_initial';
import * as migration_20261103_050000_enable_rls from './20261103_050000_enable_rls';
import * as migration_20261103_065039_tracking from './20261103_065039_tracking';
import * as migration_20261103_152640_storage_object_key from './20261103_152640_storage_object_key';
import * as migration_20261105_200201_course_feedback from './20261105_200201_course_feedback';
import * as migration_20261106_010000_course_access_documents from './20261106_010000_course_access_documents';

export const migrations = [
  {
    up: migration_20261103_040758_initial.up,
    down: migration_20261103_040758_initial.down,
    name: '20261103_040758_initial',
  },
  {
    up: migration_20261103_050000_enable_rls.up,
    down: migration_20261103_050000_enable_rls.down,
    name: '20261103_050000_enable_rls',
  },
  {
    up: migration_20261103_065039_tracking.up,
    down: migration_20261103_065039_tracking.down,
    name: '20261103_065039_tracking',
  },
  {
    up: migration_20261103_152640_storage_object_key.up,
    down: migration_20261103_152640_storage_object_key.down,
    name: '20261103_152640_storage_object_key',
  },
  {
    up: migration_20261105_200201_course_feedback.up,
    down: migration_20261105_200201_course_feedback.down,
    name: '20261105_200201_course_feedback',
  },
  {
    up: migration_20261106_010000_course_access_documents.up,
    down: migration_20261106_010000_course_access_documents.down,
    name: '20261106_010000_course_access_documents'
  },
];
