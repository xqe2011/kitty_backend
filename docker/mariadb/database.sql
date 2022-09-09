/*
 Navicat Premium Data Transfer

 Source Server         : kitty
 Source Server Type    : MariaDB
 Source Server Version : 100605
 Source Host           : localhost:3306
 Source Schema         : kitty

 Target Server Type    : MariaDB
 Target Server Version : 100605
 File Encoding         : 65001

 Date: 15/03/2022 09:46:46
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for achievement
-- ----------------------------
DROP TABLE IF EXISTS `achievement`;
CREATE TABLE `achievement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `enable` tinyint(4) NOT NULL DEFAULT 1,
  `createdDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for article
-- ----------------------------
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `canBeListed` tinyint(4) NOT NULL DEFAULT 1,
  `coverFileName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `summary` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `deleteDate` datetime(6) DEFAULT NULL,
  `commentsAreaId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_526525f1a975525193006f43899` (`commentsAreaId`),
  CONSTRAINT `FK_526525f1a975525193006f43899` FOREIGN KEY (`commentsAreaId`) REFERENCES `comments_area` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for cat
-- ----------------------------
DROP TABLE IF EXISTS `cat`;
CREATE TABLE `cat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` enum('0','1','2','3','4','5') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1',
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `species` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `isNeuter` tinyint(4) NOT NULL DEFAULT 0,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `haunt` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `createdDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `commentsAreaId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_ea409e3eae693d681fbd174c3d0` (`commentsAreaId`),
  CONSTRAINT `FK_ea409e3eae693d681fbd174c3d0` FOREIGN KEY (`commentsAreaId`) REFERENCES `comments_area` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for cat_photo
-- ----------------------------
DROP TABLE IF EXISTS `cat_photo`;
CREATE TABLE `cat_photo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('0','1','2') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '2',
  `fileName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `catId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_71aa04e7e61078f7a8b6903614` (`catId`),
  CONSTRAINT `FK_71aa04e7e61078f7a8b6903614d` FOREIGN KEY (`catId`) REFERENCES `cat` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for cat_recommendation
-- ----------------------------
DROP TABLE IF EXISTS `cat_recommendation`;
CREATE TABLE `cat_recommendation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cats` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `deleteDate` datetime(6) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_a2fe5bf25eb7053d7d77ada1931` (`userId`),
  CONSTRAINT `FK_a2fe5bf25eb7053d7d77ada1931` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for cat_user_photo
-- ----------------------------
DROP TABLE IF EXISTS `cat_user_photo`;
CREATE TABLE `cat_user_photo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `position` geometry NOT NULL,
  `positionAccuration` int(11) NOT NULL,
  `compassAngle` int(11) NOT NULL,
  `fileName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `deleteDate` datetime(6) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `catId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_fa41808a05ba3ec928b6f1544d0` (`userId`),
  KEY `FK_743d01b750993a9bb1f5ff499c9` (`catId`),
  CONSTRAINT `FK_743d01b750993a9bb1f5ff499c9` FOREIGN KEY (`catId`) REFERENCES `cat` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_fa41808a05ba3ec928b6f1544d0` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for cat_vector
-- ----------------------------
DROP TABLE IF EXISTS `cat_vector`;
CREATE TABLE `cat_vector` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('0','1','2','3','4','5') COLLATE utf8mb4_unicode_ci NOT NULL,
  `percent` int(11) NOT NULL DEFAULT 100,
  `createdDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `catId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_db05104c0a5444c03023d71750` (`catId`),
  CONSTRAINT `FK_db05104c0a5444c03023d717506` FOREIGN KEY (`catId`) REFERENCES `cat` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for comment
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `status` enum('0','1','2') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0',
  `conversationID` int(11) DEFAULT NULL,
  `content` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `deleteDate` datetime(6) DEFAULT NULL,
  `areaId` int(11) NOT NULL,
  `parentCommentId` int(11) DEFAULT NULL,
  `userId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_bbba25d5a40625155a44f1deaf` (`areaId`),
  KEY `IDX_73aac6035a70c5f0313c939f23` (`parentCommentId`),
  KEY `IDX_38c4801af6c94c9c5ebba51790` (`conversationID`),
  KEY `FK_c0354a9a009d3bb45a08655ce3b` (`userId`),
  CONSTRAINT `FK_73aac6035a70c5f0313c939f237` FOREIGN KEY (`parentCommentId`) REFERENCES `comment` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_bbba25d5a40625155a44f1deafa` FOREIGN KEY (`areaId`) REFERENCES `comments_area` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_c0354a9a009d3bb45a08655ce3b` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for comments_area
-- ----------------------------
DROP TABLE IF EXISTS `comments_area`;
CREATE TABLE `comments_area` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `isDisplay` tinyint(4) NOT NULL,
  `createdDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `deleteDate` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for points_transaction
-- ----------------------------
DROP TABLE IF EXISTS `points_transaction`;
CREATE TABLE `points_transaction` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reason` enum('0','1','2','3','4') COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` int(11) NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `userId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_aea0934cf39899e712c53ad260` (`userId`),
  CONSTRAINT `FK_aea0934cf39899e712c53ad2603` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for setting
-- ----------------------------
DROP TABLE IF EXISTS `setting`;
CREATE TABLE `setting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `canClientFetch` tinyint(4) NOT NULL DEFAULT 0,
  `createdDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `deleteDate` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_1c4c95d773004250c157a744d6` (`key`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unionID` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nickName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `avatarFileName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('0','1','2','3') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '1',
  `points` int(11) NOT NULL DEFAULT 0,
  `lastLoginDate` datetime NOT NULL,
  `createdDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  PRIMARY KEY (`id`),
  KEY `IDX_8d20980c1bf6df0cf57d42d69a` (`unionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for user_achievement
-- ----------------------------
DROP TABLE IF EXISTS `user_achievement`;
CREATE TABLE `user_achievement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `percent` int(11) NOT NULL DEFAULT 0,
  `createdDate` datetime(6) NOT NULL DEFAULT current_timestamp(6),
  `updatedDate` datetime(6) NOT NULL DEFAULT current_timestamp(6) ON UPDATE current_timestamp(6),
  `userId` int(11) NOT NULL,
  `achievementId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_2a418515c335cab7c5ba70c28b` (`userId`),
  KEY `IDX_843ecd1965f1aac694875674a1` (`achievementId`),
  CONSTRAINT `FK_2a418515c335cab7c5ba70c28b3` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_843ecd1965f1aac694875674a18` FOREIGN KEY (`achievementId`) REFERENCES `achievement` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for user_log
-- ----------------------------
DROP TABLE IF EXISTS `user_log`;
CREATE TABLE `user_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('0','1','2','3','4','5') COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdDate` datetime NOT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_85f2dd25304ee3a9e43a5c5bcae` (`userId`),
  CONSTRAINT `FK_85f2dd25304ee3a9e43a5c5bcae` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
