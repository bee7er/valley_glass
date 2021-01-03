-- MySQL dump 10.13  Distrib 5.6.33, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: russ_201606
-- ------------------------------------------------------
-- Server version	5.6.33-0ubuntu0.14.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `languages`
--

DROP TABLE IF EXISTS `languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `languages` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `position` int(11) DEFAULT NULL,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL,
  `lang_code` varchar(10) COLLATE utf8_unicode_ci NOT NULL,
  `user_id` int(10) unsigned DEFAULT NULL,
  `user_id_edited` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `languages_name_unique` (`name`),
  UNIQUE KEY `languages_lang_code_unique` (`lang_code`),
  KEY `languages_user_id_foreign` (`user_id`),
  KEY `languages_user_id_edited_foreign` (`user_id_edited`),
  CONSTRAINT `languages_user_id_edited_foreign` FOREIGN KEY (`user_id_edited`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `languages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `languages`
--

LOCK TABLES `languages` WRITE;
/*!40000 ALTER TABLE `languages` DISABLE KEYS */;
INSERT INTO `languages` VALUES (1,NULL,'English','gb',NULL,NULL,'2016-10-16 12:04:38','2016-10-16 12:04:38',NULL),(2,NULL,'Српски','rs',NULL,NULL,'2016-10-16 12:04:38','2016-10-16 12:04:38',NULL),(3,NULL,'Bosanski','ba',NULL,NULL,'2016-10-16 12:04:38','2016-10-16 12:04:38',NULL);
/*!40000 ALTER TABLE `languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `migration` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES ('2014_10_12_000000_create_users_table',1),('2014_10_12_100000_create_password_resets_table',1),('2014_10_18_195027_create_languages_table',1),('2016_07_09_131600_create_templates_table',1),('2016_07_09_131700_create_resources_table',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_resets`
--

DROP TABLE IF EXISTS `password_resets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_resets` (
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  KEY `password_resets_email_index` (`email`),
  KEY `password_resets_token_index` (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_resets`
--

LOCK TABLES `password_resets` WRITE;
/*!40000 ALTER TABLE `password_resets` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_resets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `resources`
--

DROP TABLE IF EXISTS `resources`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `resources` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` enum('video','gif','image') COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `content_a` text COLLATE utf8_unicode_ci,
  `content_b` text COLLATE utf8_unicode_ci,
  `image` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `thumb` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `template_id` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `resources_template_id_foreign` (`template_id`),
  CONSTRAINT `resources_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resources`
--

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
INSERT INTO `resources` VALUES (45,'video','Chips & Waffles','How chips and waffles come from a potato.<br /> <a href=\"https://vimeo.com/145770435\">Chips &amp; Waffles</a> from <a\nhref=\"https://vimeo.com/russether\">Russell Etheridge</a> on <a href=\"https://vimeo.com\">Vimeo</a>.','Hello from content A','Hello from content B','','chipwaffle_still.png','https://player.vimeo.com/video/145770435',12,'2016-10-16 12:47:36','2016-10-16 12:47:36',NULL),(46,'video','Bathroom Boarder','A little arachnid themed short I managed to squeeze out during spare time.','Hello from content A','Hello from content B','','spidy.png','https://player.vimeo.com/video/137499366',12,'2016-10-16 12:47:36','2016-10-16 12:47:36',NULL),(47,'video','Propz - Binoculars','My feline-vision-aid contribution to the Propz series.','Hello from content A','Hello from content B','','binoculars.jpg','https://player.vimeo.com/video/122770363',12,'2016-10-16 12:47:36','2016-10-16 12:47:36',NULL),(48,'gif','Blizzard Walk','A little animation test.','Hello from content A','Hello from content B','blizzard_loop.gif','blizzard.jpg','blizzard_loop.gif',10,'2016-10-16 12:47:36','2016-10-16 12:47:36',NULL),(49,'video','Weetabix - On the Go','A series of quick morning cheats I designed and directed for Weetabix.','Hello from content A','Hello from content B','','catchaleavingtrain.jpg','',12,'2016-10-16 12:47:36','2016-10-16 12:47:36',NULL),(50,'video','Propz - Shoelaces','My valentines-shoe contribution to the Propz series.','Hello from content A','Hello from content B','','shoelaces.jpg','https://player.vimeo.com/video/119444475',12,'2016-10-16 12:47:36','2016-10-16 12:47:36',NULL),(51,'video','Showreel 2014','My feline-vision-aid contribution to the Propz series.','Hello from content A','Hello from content B','','showreel2014.png','https://player.vimeo.com/video/104406081',12,'2016-10-16 12:47:36','2016-10-16 12:47:36',NULL),(52,'video','The Lion','Award winning animated music video for US based band Escapist Papers.','Hello from content A','Hello from content B','','thelion.jpg','https://player.vimeo.com/video/60453523',12,'2016-10-16 12:47:36','2016-10-16 12:47:36',NULL),(53,'video','Robbie Williams – Take the Crown','Promo for Robbie Williams’ ‘Take the Crown’ album release.','Hello from content A','Hello from content B','','robbiew.jpg','http://player.vimeo.com/video/69224915',12,'2016-10-16 12:47:36','2016-10-16 12:47:36',NULL),(54,'image','Blackberry – Those Who Do','Computer game style footballer…','Hello from content A','Hello from content B','9ca298e803a2960f11d20681ed96216d3d2c4c21.jpg','blackberry.jpg','blackberry.jpg',11,'2016-10-16 12:47:36','2016-10-16 12:47:36',NULL),(55,'image','Merry Xmas!','An animated Xmas card, created with Cinema 4D and After Effects.','Hello from content A','Hello from content B','30936a68dc1ea567f08dea544a89c2cdd7927a13.jpg','xmas_still_life.jpg','xmas_still_life.jpg',11,'2016-10-16 12:47:36','2016-10-16 12:47:36',NULL);
/*!40000 ALTER TABLE `resources` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `templates`
--

DROP TABLE IF EXISTS `templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `templates` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `container` text COLLATE utf8_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `templates`
--

LOCK TABLES `templates` WRITE;
/*!40000 ALTER TABLE `templates` DISABLE KEYS */;
INSERT INTO `templates` VALUES (9,'Default template','\n<div style=\"width: 100%;padding:0;margin:0;border:0px solid blue;text-align: center;\">\n    <span style=\"width: 480px;\"><table\n                    style=\"width:480px;padding:5px;margin: 0px auto;\">\n                <tr style=\"border:0px solid red;\">\n                    <td style=\"border:1px solid #c4c4c4;\" colspan=\"2\"><h3 style=\"margin:0;padding:0;\">#NAME#</h3></td>\n                </tr>\n                <tr style=\"border:0px solid red;\">\n                    <td style=\"border:1px solid #c4c4c4;\">#CONTENT_A#</td>\n                    <td style=\"border:1px solid #c4c4c4;\">#CONTENT_B#</td>\n                </tr>\n            </table><img style=\"border:1px solid #d2d2d2;\" src=\"../img/images/#IMAGE#\" width=\"480\" frameborder=\"0\">\n    <p style=\"border:0px solid red;\"><p style=\"border:0px solid red;\">#DESCRIPTION#</p>\n    <p style=\"text-align: center;\"><a href=\"/\"><img src=\"../img/back.png\" alt=\"Go back\" title=\"Go back\" width=\"38px\"></a></p></span></div>','2016-10-16 12:47:34','2016-10-16 12:47:34',NULL),(10,'GIF template','\n<div style=\"width: 100%;padding:0;margin:0;border:0px solid blue;text-align: center;\">\n    <span style=\"width: 480px;\"><table\n                    style=\"width:480px;padding:5px;margin: 0px auto;\">\n                <tr style=\"border:0px solid red;\">\n                    <td style=\"border:1px solid #c4c4c4;\" colspan=\"2\"><h3 style=\"margin:0;padding:0;\">#NAME#</h3></td>\n                </tr>\n                <tr style=\"border:0px solid red;\">\n                    <td style=\"border:1px solid #c4c4c4;\">#CONTENT_A#</td>\n                    <td style=\"border:1px solid #c4c4c4;\">#CONTENT_B#</td>\n                </tr>\n            </table><img style=\"border:1px solid #d2d2d2;\" src=\"../appfiles/resource/#IMAGE#\" width=\"480\" height=\"480\" frameborder=\"0\">\n    <p style=\"border:0px solid red;\">#DESCRIPTION#</p>\n    <p style=\"text-align: center;\"><a href=\"/\"><img src=\"../img/back.png\" alt=\"Go back\" title=\"Go back\" width=\"38px\"></a></p></span></div>','2016-10-16 12:47:34','2016-10-16 12:47:34',NULL),(11,'Image template','\n<div style=\"width: 100%;padding:0;margin:0;border:0px solid blue;text-align: center;\">\n    <span style=\"width: 480px;\"><table\n                    style=\"width:480px;padding:5px;margin: 0px auto;\">\n                <tr style=\"border:0px solid red;\">\n                    <td style=\"border:1px solid #c4c4c4;\" colspan=\"2\"><h3 style=\"margin:0;padding:0;\">#NAME#</h3></td>\n                </tr>\n                <tr style=\"border:0px solid red;\">\n                    <td style=\"border:1px solid #c4c4c4;\">#CONTENT_A#</td>\n                    <td style=\"border:1px solid #c4c4c4;\">#CONTENT_B#</td>\n                </tr>\n            </table><img style=\"border:1px solid #d2d2d2;\" src=\"../appfiles/resource/#IMAGE#\" width=\"480\" frameborder=\"0\">\n    <p style=\"border:0px solid red;\">#DESCRIPTION#</p>\n    <p style=\"text-align: center;\"><a href=\"/\"><img src=\"../img/back.png\" alt=\"Go back\" title=\"Go back\" width=\"38px\"></a></p></span></div>','2016-10-16 12:47:34','2016-10-16 12:47:34',NULL),(12,'Video template','\n<div style=\"width: 100%;padding:0;margin:0;text-align: center;\">\n    <span style=\"width: 480px;\"><table\n                    style=\"width:480px;padding:5px;margin: 0px auto;\">\n                <tr style=\"border:0px solid red;\">\n                    <td style=\"border:1px solid #c4c4c4;\" colspan=\"2\"><h3 style=\"margin:0;padding:0;\">#NAME#</h3></td>\n                </tr>\n                <tr style=\"border:0px solid red;\">\n                    <td style=\"border:1px solid #c4c4c4;\">#CONTENT_A#</td>\n                    <td style=\"border:1px solid #c4c4c4;\">#CONTENT_B#</td>\n                </tr>\n            </table><iframe style=\"border:1px solid #d2d2d2;\" src=\"#URL#\" width=\"480\" height=\"480\"\n    frameborder=\"0\" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>\n    <p style=\"border:0px solid red;\">#DESCRIPTION#</p>\n    <p style=\"text-align: center;\"><a href=\"#BASE_URL#\"><img src=\"../img/back.png\" alt=\"Go back\" title=\"Go back\" width=\"38px\"></a></p></span></div>','2016-10-16 12:47:34','2016-10-16 12:47:34',NULL);
/*!40000 ALTER TABLE `templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(60) COLLATE utf8_unicode_ci NOT NULL,
  `confirmation_code` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `admin` tinyint(1) NOT NULL DEFAULT '0',
  `remember_token` varchar(100) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-10-16 13:55:40
