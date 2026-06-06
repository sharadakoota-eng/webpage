SET @fee_structure_table = (
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = DATABASE() AND LOWER(table_name) = 'feestructure'
  LIMIT 1
);

SET @fee_code_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = @fee_structure_table
    AND column_name = 'feeCode'
);
SET @fee_code_sql = IF(
  @fee_code_exists = 0,
  CONCAT('ALTER TABLE `', @fee_structure_table, '` ADD COLUMN `feeCode` VARCHAR(191) NULL'),
  'SELECT 1'
);
PREPARE fee_code_stmt FROM @fee_code_sql;
EXECUTE fee_code_stmt;
DEALLOCATE PREPARE fee_code_stmt;

SET @is_enabled_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = @fee_structure_table
    AND column_name = 'isEnabled'
);
SET @is_enabled_sql = IF(
  @is_enabled_exists = 0,
  CONCAT('ALTER TABLE `', @fee_structure_table, '` ADD COLUMN `isEnabled` BOOLEAN NOT NULL DEFAULT true'),
  'SELECT 1'
);
PREPARE is_enabled_stmt FROM @is_enabled_sql;
EXECUTE is_enabled_stmt;
DEALLOCATE PREPARE is_enabled_stmt;

SET @fee_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = @fee_structure_table
    AND index_name = 'FeeStructure_programId_feeCode_idx'
);
SET @fee_index_sql = IF(
  @fee_index_exists = 0,
  CONCAT('CREATE INDEX `FeeStructure_programId_feeCode_idx` ON `', @fee_structure_table, '`(`programId`, `feeCode`)'),
  'SELECT 1'
);
PREPARE fee_index_stmt FROM @fee_index_sql;
EXECUTE fee_index_stmt;
DEALLOCATE PREPARE fee_index_stmt;
