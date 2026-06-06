SET @admission_table = (
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = DATABASE() AND LOWER(table_name) = 'admission'
  LIMIT 1
);
SET @admission_status_sql = CONCAT(
  'ALTER TABLE `',
  @admission_table,
  '` MODIFY `status` ENUM(''DRAFT'', ''SUBMITTED'', ''UNDER_REVIEW'', ''DOCUMENTS_PENDING'', ''APPROVED'', ''REJECTED'', ''WAITLISTED'', ''CANCELLED'') NOT NULL DEFAULT ''SUBMITTED'''
);
PREPARE admission_status_stmt FROM @admission_status_sql;
EXECUTE admission_status_stmt;
DEALLOCATE PREPARE admission_status_stmt;

SET @invoice_table = (
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = DATABASE() AND LOWER(table_name) = 'invoice'
  LIMIT 1
);
SET @invoice_status_sql = CONCAT(
  'ALTER TABLE `',
  @invoice_table,
  '` MODIFY `status` ENUM(''DRAFT'', ''ISSUED'', ''PARTIALLY_PAID'', ''PAID'', ''OVERDUE'', ''CANCELLED'') NOT NULL DEFAULT ''ISSUED'''
);
PREPARE invoice_status_stmt FROM @invoice_status_sql;
EXECUTE invoice_status_stmt;
DEALLOCATE PREPARE invoice_status_stmt;

CREATE TABLE IF NOT EXISTS `numbersequence` (
  `id` VARCHAR(191) NOT NULL,
  `key` VARCHAR(191) NOT NULL,
  `prefix` VARCHAR(191) NOT NULL,
  `financialYear` VARCHAR(191) NOT NULL,
  `lastNumber` INTEGER NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  UNIQUE INDEX `NumberSequence_key_key`(`key`),
  INDEX `NumberSequence_prefix_financialYear_idx`(`prefix`, `financialYear`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
