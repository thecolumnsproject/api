# Create and use the Columns database
CREATE DATABASE IF NOT EXISTS columns;
USE columns;

# Create a table for the tables
CREATE TABLE IF NOT EXISTS `tables` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `source_url` varchar(255) DEFAULT NULL,
  `columns` varchar(255) DEFAULT NULL,
  `layout` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

# Create the types table
-- CREATE TABLE IF NOT EXISTS `types` (
--   `id` mediumint(9) NOT NULL AUTO_INCREMENT,
--   `name` varchar(255) DEFAULT NULL,
--   PRIMARY KEY (`id`),
--   UNIQUE KEY `name` (`name`) USING BTREE,
--   FULLTEXT KEY `fulltext` (`name`)
-- ) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

# Create the entities table
-- CREATE TABLE IF NOT EXISTS `entities` (
--   `id` mediumint(9) NOT NULL AUTO_INCREMENT,
--   `name` varchar(255) DEFAULT NULL,
--   PRIMARY KEY (`id`),
--   UNIQUE KEY `name` (`name`) USING BTREE
-- ) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

# Create the columns table
-- CREATE TABLE IF NOT EXISTS `columns` (
--   `id` mediumint(9) NOT NULL AUTO_INCREMENT,
--   `name` varchar(255) NOT NULL,
--   PRIMARY KEY (`id`),
--   UNIQUE KEY `name` (`name`) USING BTREE,
--   FULLTEXT KEY `fulltext` (`name`)
-- ) ENGINE=MyISAM AUTO_INCREMENT=66 DEFAULT CHARSET=utf8;

# Create the entities_to_types table
-- CREATE TABLE IF NOT EXISTS `entities_to_types` (
--   `entityId` mediumint(9) NOT NULL,
--   `typeId` mediumint(9) NOT NULL,
--   UNIQUE KEY `entity_and_type` (`entityId`,`typeId`) USING BTREE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

# Create the entities_to_types table
-- CREATE TABLE IF NOT EXISTS `columns_to_entities` (
--   `columnId` mediumint(9) NOT NULL,
--   `entityId` mediumint(9) NOT NULL,
--   UNIQUE KEY `column_and_entity` (`columnId`,`entityId`) USING BTREE
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8;



