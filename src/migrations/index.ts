import * as migration_20261103_040758_initial from './20261103_040758_initial';
import * as migration_20261103_050000_enable_rls from './20261103_050000_enable_rls';
import * as migration_20261103_065039_tracking from './20261103_065039_tracking';
import * as migration_20261103_152640_storage_object_key from './20261103_152640_storage_object_key';
import * as migration_20261105_200201_course_feedback from './20261105_200201_course_feedback';
import * as migration_20261106_010000_course_access_documents from './20261106_010000_course_access_documents';
import * as migration_20261109_120000_feedback_publish from './20261109_120000_feedback_publish';
import * as migration_20261109_130000_site_feedback from './20261109_130000_site_feedback';
import * as migration_20261109_150000_site_feedback_details from './20261109_150000_site_feedback_details';
import * as migration_20261109_180000_course_intro from './20261109_180000_course_intro';
import * as migration_20261111_100000_course_modules_shown from './20261111_100000_course_modules_shown';
import * as migration_20261111_120000_course_target_audience from './20261111_120000_course_target_audience';
import * as migration_20261111_140000_open_course_modules from './20261111_140000_open_course_modules';
import * as migration_20261111_160000_library_description_optional from './20261111_160000_library_description_optional';
import * as migration_20261112_100000_certificate_numbers from './20261112_100000_certificate_numbers';

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
  {
    up: migration_20261109_120000_feedback_publish.up,
    down: migration_20261109_120000_feedback_publish.down,
    name: '20261109_120000_feedback_publish',
  },
  {
    up: migration_20261109_130000_site_feedback.up,
    down: migration_20261109_130000_site_feedback.down,
    name: '20261109_130000_site_feedback',
  },
  {
    up: migration_20261109_150000_site_feedback_details.up,
    down: migration_20261109_150000_site_feedback_details.down,
    name: '20261109_150000_site_feedback_details',
  },
  {
    up: migration_20261109_180000_course_intro.up,
    down: migration_20261109_180000_course_intro.down,
    name: '20261109_180000_course_intro',
  },
  {
    up: migration_20261111_100000_course_modules_shown.up,
    down: migration_20261111_100000_course_modules_shown.down,
    name: '20261111_100000_course_modules_shown',
  },
  {
    up: migration_20261111_120000_course_target_audience.up,
    down: migration_20261111_120000_course_target_audience.down,
    name: '20261111_120000_course_target_audience',
  },
  {
    up: migration_20261111_140000_open_course_modules.up,
    down: migration_20261111_140000_open_course_modules.down,
    name: '20261111_140000_open_course_modules',
  },
  {
    up: migration_20261111_160000_library_description_optional.up,
    down: migration_20261111_160000_library_description_optional.down,
    name: '20261111_160000_library_description_optional',
  },
  {
    up: migration_20261112_100000_certificate_numbers.up,
    down: migration_20261112_100000_certificate_numbers.down,
    name: '20261112_100000_certificate_numbers',
  },
];
