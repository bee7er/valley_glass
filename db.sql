-- MySQL dump 10.13  Distrib 5.7.27, for Linux (x86_64)
--
-- Host: localhost    Database: valley_glass_202101
-- ------------------------------------------------------
-- Server version	5.7.27-0ubuntu0.18.04.1

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
-- Table structure for table `contents`
--

DROP TABLE IF EXISTS `contents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contents` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `seq` decimal(8,2) DEFAULT NULL,
  `title` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `url` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `videoUrl` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `html` text COLLATE utf8_unicode_ci,
  `other` text COLLATE utf8_unicode_ci,
  `resourceId` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT '0000-00-00 00:00:00',
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contents_resourceid_foreign` (`resourceId`),
  CONSTRAINT `contents_resourceid_foreign` FOREIGN KEY (`resourceId`) REFERENCES `resources` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contents`
--

LOCK TABLES `contents` WRITE;
/*!40000 ALTER TABLE `contents` DISABLE KEYS */;
INSERT INTO `contents` VALUES (1,1.00,'The main film','','https://player.vimeo.com/video/388446129','','',NULL,'2020-02-24 10:39:07','2020-06-08 04:26:20',NULL),(54,1.00,'Original concept','/img/images/shower_man_concept.png','','<p class=\"content-text\">My biggest project so far. Six windows forming a ‘T’ in the hallway of a flat, much enhancing a kitchen and bathroom.\r\n\r\nThe client conceptualised the incredibly interesting design: a man showering in an upside down position with the water streaming over him. Great idea!</p>','',1,'2021-01-11 15:54:25','2021-01-11 16:09:14',NULL),(55,2.00,'Design','/img/images/shower_man_design.jpg','','<p class=\"content-text\">Interestingly, for the first time, the designs could be printed directly from the images created in the software package used. I cut them up and stuck them together, ending up with wonderfully accurate cartoons.</p>\r\n<p class=\"content-text\">Included there is the list of colours we intended to use. All 13 of them.</p>','',1,'2021-01-11 15:56:45','2021-01-11 16:11:21',NULL),(56,3.00,'Mockup','/img/images/shower_man_mockup.png','','<p class=\"content-text\">Here we have a virtual in-situ mock up of the entire set. A great way to visualise what the final set of panels would look like.</p>\r\n<p class=\"content-text\">We could tell it was going to be amazing in the end.</p>','',1,'2021-01-11 15:58:07','2021-01-11 16:12:49',NULL),(57,4.00,'Process','','','<p class=\"content-text\">It was the usual sequence of tasks: choosing the glass, cutting, leading, finishing.</p>','',1,'2021-01-11 16:16:04','2021-01-11 16:16:04',NULL),(58,5.00,'Process image 1','/img/images/shower_man_process1.jpg','','','',1,'2021-01-11 16:16:45','2021-01-11 16:16:45',NULL),(59,6.00,'Process image 2','/img/images/shower_man_process2.jpg','','','',1,'2021-01-11 16:17:05','2021-01-11 16:17:05',NULL),(60,7.00,'Process image 3','/img/images/shower_man_process3.jpg','','','',1,'2021-01-11 16:17:30','2021-01-11 16:17:30',NULL),(61,8.00,'Finished','/img/images/shower_man_finished.jpg','','<p class=\"content-text\">Once all six panels were completed it took just a morning to fit them all into the frames.</p>\r\n<p class=\"content-text\">Brilliant.</p>','',1,'2021-01-11 16:20:17','2021-01-11 16:20:17',NULL),(62,9.00,'Shower man hair','/img/images/shower_man_hair.jpg','','<p class=\"content-text\">The original glass was an ordinary mottled clear glass; what the trade call ‘toilet’ glass. The new panels are a great improvement, especially at night with subdued light shining through.</p>','',1,'2021-01-11 16:22:31','2021-01-11 16:22:31',NULL);
/*!40000 ALTER TABLE `contents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `credits`
--

DROP TABLE IF EXISTS `credits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `credits` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `seq` decimal(8,2) DEFAULT NULL,
  `title` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `resourceId` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `credits_resourceid_foreign` (`resourceId`),
  CONSTRAINT `credits_resourceid_foreign` FOREIGN KEY (`resourceId`) REFERENCES `resources` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `credits`
--

LOCK TABLES `credits` WRITE;
/*!40000 ALTER TABLE `credits` DISABLE KEYS */;
/*!40000 ALTER TABLE `credits` ENABLE KEYS */;
UNLOCK TABLES;

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
INSERT INTO `languages` VALUES (1,NULL,'English','gb',NULL,NULL,'2016-10-16 12:04:38','2016-10-16 12:04:38',NULL),(2,NULL,'Српски','rs',NULL,NULL,'2016-10-16 12:04:38','2021-01-03 15:48:32','2021-01-03 15:48:32'),(3,NULL,'Bosanski','ba',NULL,NULL,'2016-10-16 12:04:38','2021-01-03 15:48:36','2021-01-03 15:48:36');
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
-- Table structure for table `notices`
--

DROP TABLE IF EXISTS `notices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notices` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `seq` decimal(5,2) unsigned DEFAULT '0.00',
  `notice` text COLLATE utf8_unicode_ci,
  `url` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notices`
--

LOCK TABLES `notices` WRITE;
/*!40000 ALTER TABLE `notices` DISABLE KEYS */;
/*!40000 ALTER TABLE `notices` ENABLE KEYS */;
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
  `seq` decimal(5,2) unsigned DEFAULT '0.00',
  `title` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8_unicode_ci,
  `isRepair` tinyint(1) NOT NULL DEFAULT '0',
  `thumb` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `thumbHover` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `useThumbHover` tinyint(1) NOT NULL DEFAULT '0',
  `isClickable` tinyint(1) NOT NULL DEFAULT '1',
  `titleThumb` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `titleThumbHover` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `backgroundColor` varchar(6) COLLATE utf8_unicode_ci DEFAULT NULL,
  `creditTitleColor` varchar(6) COLLATE utf8_unicode_ci DEFAULT NULL,
  `url` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `template_id` int(10) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updated_at` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `resources_template_id_foreign` (`template_id`),
  CONSTRAINT `resources_template_id_foreign` FOREIGN KEY (`template_id`) REFERENCES `templates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resources`
--

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
INSERT INTO `resources` VALUES (1,1.00,'Shower Man','showerman','<p style=\"border: 0px; font-family: Helvetica, sans-serif; font-size: 14px; margin-bottom: 15px; outline: 0px; padding: 0px; vertical-align: baseline; color: rgb(29, 29, 29);\">My biggest project so far. Six windows forming a ‘T’ in the hallway of a flat, much enhancing a kitchen and bathroom.</p><p style=\"border: 0px; font-family: Helvetica, sans-serif; font-size: 14px; margin-bottom: 15px; outline: 0px; padding: 0px; vertical-align: baseline; color: rgb(29, 29, 29);\">The client conceptualised the incredibly interesting design: a man showering in an upside down position with the water streaming over him. What a great idea?</p>',0,'/img/thumbs/shower_man_hair_th.png','/img/thumbs/shower_man_hair_hv.png',1,1,'','','008080','000','',28,'2017-02-17 11:19:20','2021-01-11 15:51:39',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `templates`
--

LOCK TABLES `templates` WRITE;
/*!40000 ALTER TABLE `templates` DISABLE KEYS */;
INSERT INTO `templates` VALUES (28,'*Default template','<body style=\"background-color: ##BACKGROUND_COLOR#;\"/> <style>.template-credits-label { color: ##CREDIT_LABEL_COLOR#; } .template-credits-row-container { background-color: ##BACKGROUND_COLOR# }</style> <div class=\"template-details-title\">#TITLE#</div>#CONTENTS#   <!--<div class=\"template-credits-title\">credits</div> <div class=\"row template-credits-row-container\"> <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"> #CREDITS#</div>-->   </div>','2020-02-24 11:20:08','2021-01-04 16:35:03',NULL),(29,'*About','<div class=\"about-text\"><p>Sunlight shining through glass. It may be textured, coloured or forged into interesting shapes. As you walk past, the light catches different angles and colours and the window comes alive with movement. Stained glass windows enhance walls, windows, doors and can even be free-standing. The sheer variation and beauty of this medium is why I learned how to work with stained glass and why I love doing it so much.</p><br/><p>This website shows some of the projects I have undertaken in creating new leaded windows and also projects for repairing or restoring existing leaded windows.</p><br/><p>Based in North London, I am always keen to take on new projects. If you have a window which would benefit from a new stained glass window, or if you have a leaded window which needs to be repaired, please contact me here for help with your design and a free estimate.</p><br/><p>brian etheridge</p></div>','2020-06-18 10:54:15','2021-01-16 10:40:45',NULL),(30,'*Contact','<div style=\"margin-top: 24px;text-align: left;\"><div class=\"form-title\">Please enter your details below and we will contact you to discuss your requirements.</div><form action=\"contact\" id=\"contactForm\" name=\"contactForm\" method=\"post\" class=\"\" novalidate=\"novalidate\"><input type=\"hidden\" id=\"_token\" name=\"_token\" value=\"\"><input type=\"hidden\" name=\"update\" value=\"1\"><p>Your Name<br><span class=\"\"><input type=\"text\" name=\"contactName\" value=\"\" size=\"40\" class=\"\"></span></p><p>Your Email<br><span class=\"\"><input type=\"email\" name=\"contactEmail\" value=\"\" size=\"40\" class=\"\"></span> </p><p>Your Message<br><span class=\"\"><textarea name=\"contactMessage\" cols=\"40\" rows=\"6\" class=\"\"></textarea></span></p><p><input type=\"submit\" value=\"Send\" class=\"submit-button\"></p></form></div><br>','2021-01-11 11:00:18','2021-01-11 17:53:00',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Brian','brian','betheridge@gmail.com','$2y$10$I5coxELkOeXrr7O1L/CIQu3iDmyPOWtYh9zgt49mtaHWxy..l5np.','dcd443e19e4b041168dfb5e83a52d64e',1,1,'yuwZ9aURZIKjYocF53WIKIYnBcqH0a2tG6uD2NAxyG1KxHbyTbMmZuYojMgf','2016-07-17 13:51:04','2021-01-16 10:59:58',NULL),(2,'Russ','russ','contact@russelletheridge.com','$2y$10$I5coxELkOeXrr7O1L/CIQu3iDmyPOWtYh9zgt49mtaHWxy..l5np.','460a2c34e121cde19a6f7e1032db472e',1,1,'FQ6CJWmQTYCnJeDYWLXAdarL63drty1Yi8KoRcVKzOgX35d0wGRlSkxEBi4p','2016-07-17 13:51:05','2018-09-16 12:16:12',NULL),(3,'Test User','test_user','user@user.com','$2y$10$kfbDKLFLt3izY/P7L7Cjj.5Pnx.p2X..bO2fJNUaGX7MZ/5KTU/XK','49b09443042a2611da1db89544b6d4c6',1,0,NULL,'2016-07-17 13:51:05','2016-07-17 13:51:05',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `v`
--

DROP TABLE IF EXISTS `v`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `v` (
  `id` int(6) unsigned NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `v`
--

LOCK TABLES `v` WRITE;
/*!40000 ALTER TABLE `v` DISABLE KEYS */;
/*!40000 ALTER TABLE `v` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-01-16 11:01:02
