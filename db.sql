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
) ENGINE=InnoDB AUTO_INCREMENT=94 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contents`
--

LOCK TABLES `contents` WRITE;
/*!40000 ALTER TABLE `contents` DISABLE KEYS */;
INSERT INTO `contents` VALUES (54,1.00,'Original concept','img/images/shower_man_concept.png','','<p class=\"content-text\">It\'s a great design, but relies on each panel lining up correctly otherwise the effect would be lost.</p>','',1,'2021-01-11 15:54:25','2021-01-16 13:26:31',NULL),(55,2.00,'Design','img/images/shower_man_design.jpg','','<p class=\"content-text\">Interestingly, for the first time, the designs could be printed directly from the images created in the software package used. I cut them up and stuck them together, ending up with wonderfully accurate cartoons.</p>\r\n<p class=\"content-text\">Included there is the list of colours we intended to use. All 13 of them.</p>','',1,'2021-01-11 15:56:45','2021-01-11 16:11:21',NULL),(56,3.00,'Mockup','img/images/shower_man_mockup.png','','<p class=\"content-text\">Here we have a virtual in-situ mock up of the entire set. A great way to visualise what the final set of panels would look like.</p>\r\n<p class=\"content-text\">We could tell it was going to be amazing in the end.</p>','',1,'2021-01-11 15:58:07','2021-01-11 16:12:49',NULL),(57,4.00,'Process','','','<p class=\"content-text\">It was the usual sequence of tasks: choosing the glass, cutting, leading, finishing.</p>','',1,'2021-01-11 16:16:04','2021-01-11 16:16:04',NULL),(58,5.00,'Process image 1','img/images/shower_man_process1.jpg','','','',1,'2021-01-11 16:16:45','2021-01-11 16:16:45',NULL),(59,6.00,'Process image 2','img/images/shower_man_process2.jpg','','','',1,'2021-01-11 16:17:05','2021-01-11 16:17:05',NULL),(60,7.00,'Process image 3','img/images/shower_man_process3.jpg','','','',1,'2021-01-11 16:17:30','2021-01-11 16:17:30',NULL),(61,8.00,'Finished','img/images/shower_man_finished.jpg','','<p class=\"content-text\">Once all six panels were completed it took just a morning to fit them all into the frames.</p>\r\n<p class=\"content-text\">Brilliant.</p>','',1,'2021-01-11 16:20:17','2021-01-11 16:20:17',NULL),(62,9.00,'Shower man hair','img/images/shower_man_hair.jpg','','<p class=\"content-text\">The original glass was an ordinary mottled clear glass; what the trade call ‘toilet’ glass. The new panels are a great improvement, especially at night with subdued light shining through.</p>','',1,'2021-01-11 16:22:31','2021-01-11 16:22:31',NULL),(63,1.00,'Concept image','img/images/moon_shadow_concept.jpg','','<p>The original design was created by a truly amazing artist, Michelle Hendry, whose work you must view here at her website <a href=\"http://artscapes.ca/\" class=\"white-link-active\" target=\"_blank\">http://artscapes.ca/</a>.<br></p><p>It looks like a drawing, and has been created using copper foil. I really liked it as soon as I saw it.</p>','',18,'2021-01-16 13:30:38','2021-01-16 13:32:59',NULL),(64,2.00,'Build image','img/images/moon_shadow_build.jpg','','<p>The final stages:</p><br><p>I am finding with my later projects how important the final stages are in a piece. I pay more and more attention to ensuring that I remove all the cement from the tightest corners of the lead work and concentrate on the brushing of the lead, too, to give it that wonderful deep lustre. I always finish off with graphite and then give the whole piece a good buffing. Getting that rich, dark shine in the lead looks great.</p>','',18,'2021-01-16 13:34:39','2021-01-16 13:34:39',NULL),(65,3.00,'Finished image','img/images/moon_shadow_finished.jpg','','<p>The finished window:<br></p><p>Check it out! I was worried that the dark blue glass in combination with the jet black and opaque glass would be too dark, but it looks great.</p>','',18,'2021-01-16 13:36:52','2021-01-16 13:37:23',NULL),(66,1.00,'Concept image','img/images/lillies_concept.jpg','','<p>The design:</p><br>\r\n<p>The original design was found by searching the web for any picture featuring one or more lilies.</p><br>\r\n<p>As with other designs I find on the web, this one could not have been used without some adjustment, as the lead version could not have been successfully made exactly like that; the top flower would need to touch the left hand border.</p>','',19,'2021-01-16 13:44:03','2021-01-16 13:55:58',NULL),(67,2.00,'Design image','img/images/lillies_design.jpg','','<p>The cartoon:</p><br><p>An accurate cartoon was the first stage, as ever.</p>','',19,'2021-01-16 13:45:04','2021-01-16 13:55:31',NULL),(68,3.00,'Build image','img/images/lillies_build.jpg','','<p>Into the leading stage:</p><br><p>Quite a number of individual pieces and mostly curves.</p><br><p>You will notice that at the time I took this snap I had not decided on the colour to make the stamen in each flower.  I eventually opted for a grey, which looks just right in the finished product.</p>','',19,'2021-01-16 13:46:08','2021-01-16 13:56:24',NULL),(69,4.00,'Finished image','img/images/lillies_finished.jpg','','<p>And here is the completed window:</p><br><p>The colours work well together and match really well with the wall paper and general decoration of the room (not shown).</p><br><p>Notice how I allowed the leaves to spill over into the border. I like the effect that gives the panel, almost 3D.</p>','l',19,'2021-01-16 13:46:56','2021-01-16 13:52:40',NULL),(70,1.00,'Example image','img/images/door_lillies_example.jpg','','<p>The design.</p><br><p>The original design was taken from the neighbour’s front door.</p>','',20,'2021-01-17 10:37:49','2021-01-17 10:50:25',NULL),(71,2.00,'Pattern image','img/images/door_lillies_pattern.jpg','','<p>The cartoon.</p><br><p>An accurate cartoon was the first stage, as ever. The paper rubbing came in most useful at this time to ensure that I got the proportions right. I was careful to get each part of the design in just the right place.</p>','',20,'2021-01-17 10:39:13','2021-01-17 10:50:40',NULL),(72,3.00,'Build image','img/images/door_lillies_build1.jpg','','<p>Into the leading stage.</p><br><p>It was tricky cutting the 57 pieces (that’s 114 in total for the two panels!). And with 13 different types of glass I had to be meticulous with my numbering. As usual with most pieces having at least one curved edge it was important to keep the nails in place as I built each window up.</p>','',20,'2021-01-17 10:40:15','2021-01-17 10:50:56',NULL),(73,4.00,'Build image','img/images/door_lillies_build2.jpg','','<p>The leading of the first window is complete.</p><br><p>I can tell that we are looking at the first window, even though the pair are (pretty much) identical, because I can see the second roundel leaning up against the wall in the background. Haha!</p>','',20,'2021-01-17 10:41:05','2021-01-17 10:51:11',NULL),(74,5.00,'Finished image','img/images/door_lillies_finished.jpg','','<p>And here are the completed windows.</p><br><p>Beautiful result. Very traditional. Will look fantastic when they are mounted in the front door.</p>','',20,'2021-01-17 10:42:06','2021-01-17 10:51:44',NULL),(75,1.00,'Original image','img/images/canopy_original.jpg','','<p>This is what I was presented with:</p><br><p>It looks very dramatic. Of course, the state of the original piece is irrelevant. I kept as much of the glass as possible, but the main purpose in having the remains of the window was simply to help with the design of the new one.</p><br><p>It’s an important point. It amuses me that you can go along to a reclamation yard and pay hundreds of pounds for an old and creaky leaded window. What would you do with it? Reuse the design, perhaps, and reuse what’s left of the glass? Total nonsense. If you come across an old leaded window, and you like the look of it, take a photograph of it. That’s all you need to do.</p><br><p>In this case, all four blue squares were intact and I managed to extract several long pieces of bubbled glass, which I could reuse in the new window. I then bought the remaining plain and bubbled glass to match for a few pounds.</p>','',21,'2021-01-18 09:03:19','2021-01-18 09:03:19',NULL),(76,2.00,'Design image','img/images/canopy_design.jpg','','<p>The template consisted of all straight lines. Not a curve anywhere. That made the whole process so much easier. The template was symmetrical on both axes and could be drawn up very accurately and the glass was quick and easy to cut to the exact shape required.</p><br><p>Likewise, when it came to constructing the window, it all slotted into place very easily; the lead fitted together well with very little wastage.</p>','',21,'2021-01-18 09:04:50','2021-01-18 09:04:50',NULL),(77,3.00,'Finished image','img/images/canopy_finished.jpg','','<p>The finished product:</p><br><p>Quick and relatively easy to do, because of the straight lines, and looks fantastic.</p>','',21,'2021-01-18 09:05:51','2021-01-18 09:05:51',NULL),(78,4.00,'In situ image','img/images/canopy_insitu.jpg','','<p>Update:</p><br><p>Quite some time later the client had a lobby door remodelled and used the panel to make that much more interesting.</p>','',21,'2021-01-18 09:06:57','2021-01-18 09:06:57',NULL),(79,1.00,'Original image','img/images/candle_original.jpg','','<p>Here’s the original bay window and the door:</p>','',22,'2021-01-18 09:47:44','2021-01-18 09:47:44',NULL),(80,2.00,'Tracing image','img/images/candle_tracing.jpg','','<p>To match the design exactly, I started by taking a greaseproof paper impression of the existing window:</p>','',22,'2021-01-18 09:48:33','2021-01-18 09:48:33',NULL),(81,3.00,'Tracing design image','img/images/candle_tracing_design.jpg','','<p>Use the tracing to create the cartoon. Carefully recreating the design in the centre. I adjusted, very slightly, the size of the squares onto which the candle itself was superimposed, so that they were evenly proportioned, albeit a slightly different size to the squares of the bay. I guessed correctly that the difference would not be noticeable when the window is installed, whereas, different sizes of squares or half a square, within the design itself, would stick out like a sore thumb.</p>','',22,'2021-01-18 09:49:27','2021-01-18 09:49:27',NULL),(82,4.00,'Build image','img/images/candle_build.jpg','','<p>Developing the window. The cartoon is finished and the border glass is cut:</p>','',22,'2021-01-18 09:50:08','2021-01-18 09:50:08',NULL),(83,5.00,'Build glass image','img/images/candle_build_glass.jpg','','<p>At this stage all the glass has been cut:</p>','',22,'2021-01-18 09:51:14','2021-01-18 09:51:14',NULL),(84,6.00,'Build progress image','img/images/candle_build_progress.jpg','','<p>Putting it all together. Here I am at the tricky central area, which involved the usual juggling to get the curved glass pieces to fit correctly together.</p>','',22,'2021-01-18 09:52:01','2021-01-18 09:52:01',NULL),(85,7.00,'Build soldered image','img/images/candle_build_soldered.jpg','','<p>Here the leading is finished. Just have to solder the entire piece on both sides and insert the putty-cement:</p>','',22,'2021-01-18 09:52:59','2021-01-18 09:52:59',NULL),(86,8.00,'Finished image','img/images/candle_finished.jpg','','<p>It is done. Looks great.  I must try to get a snap of it in the door.</p>','',22,'2021-01-18 09:53:34','2021-01-18 09:53:34',NULL),(87,1.00,'Original image','img/images/song_bird_original.jpg','','<p>This image shows the original pair of panels in the door.</p><br><p>Note the mismatching diamond centres. The panel on the right was rebuilt previously and whoever did it had to contend with a broken and presumably unrepairable diamond piece. They replaced it with a piece of yellow textured glass and then stuck a picture of a whale and rainbow in the middle. Hmmm, nice.</p><br><p>The panel on the left is the one that needed to be rebuilt, and note that it had reinforcing rods at intervals. These were needed because the panels are quite large, being 140cm tall and 40cm wide.</p><br><p>Another glaring issue was that the rebuilt panel had not been put back together correctly. Notice how the roundels had been set closer to the diamond than in the original. Whoops. I confirmed with the client that I should adjust the design in a similar manner during the rebuild.</p>','',23,'2021-01-18 12:52:51','2021-01-18 12:52:51',NULL),(88,2.00,'Damage image','img/images/song_bird_damage1.jpg','','<p>Looking closely at the panel you can see how several of the pieces were broken. Getting replacements specially made was going to be too expensive, so I decided to repair as many as I could. Missing pieces would be replaced with textured coloured glass and everything rearranged to give the final panel a balanced look.</p><br>','',23,'2021-01-18 12:53:54','2021-01-18 12:53:54',NULL),(89,3.00,'Damage image','img/images/song_bird_damage2.jpg','','<p>There were several pieces actually missing. One had been replaced already with a piece of translucent glass, which looked decidedly odd and was half blanked out with some sticky tape.</p>','',23,'2021-01-18 12:54:47','2021-01-18 12:58:08',NULL),(90,4.00,'Damage image','img/images/song_bird_damage3.jpg','','<p>The sticky tape was holding one section together as the lead was weathered badly and had very little putty stopping it from collapsing.</p>','',23,'2021-01-18 12:55:42','2021-01-18 12:58:58',NULL),(91,5.00,'Damage image','img/images/song_bird_damage4.jpg','','<p>Luckily the song bird diamond on the panel to be rebuilt was in perfect condition. You can imagine how carefully I handled the removal of the panel from the door and the subsequent dismantling of it when I got it back to the workshop.</p>','',23,'2021-01-18 12:56:23','2021-01-18 12:59:20',NULL),(92,6.00,'Build image','img/images/song_bird_build.jpg','','<p>This image shows a stage in the rebuilding process. Overall the job easy since the panel consists mostly of straight lines and the various squares that needed to be repaired just made the task interesting.</p>','',23,'2021-01-18 13:00:06','2021-01-18 13:00:06',NULL),(93,7.00,'Finished image','img/images/song_bird_finished.jpg','','<p>The final panel installed back in the door. All the broken pieces have been fixed. All new lead and some new glass for those missing pieces.</p><br><p>Note that the two panels now match perfectly. The roundels on the new panel have been moved to line up with those on the right and check out the diamond piece on the right.</p><br><p>To make the pieces match exactly I had the diamond on the left photocopied, flipped over and printed on sticky backed acetate. It was a bit tricky to get the size right, but with some expert assistance we managed to sort it out. And doesn’t it look fantastic!</p>','',23,'2021-01-18 13:01:13','2021-01-18 13:01:13',NULL);
/*!40000 ALTER TABLE `contents` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `resources`
--

LOCK TABLES `resources` WRITE;
/*!40000 ALTER TABLE `resources` DISABLE KEYS */;
INSERT INTO `resources` VALUES (1,1.00,'Shower Man','showerman','<p>My biggest project so far. Six windows forming a ‘T’ in the hallway of a flat, much enhancing a kitchen and bathroom.</p><br><p>The client conceptualised the incredibly interesting design: a man showering in an upside down position with the water streaming over him. What a great idea?</p>',0,'img/thumbs/shower_man_hair_th.png','img/thumbs/shower_man_hair_th.png',1,1,'','','008080','000','',28,'2017-02-17 11:19:20','2021-01-16 13:05:41',NULL),(18,2.00,'Moon Shadow','moonshadow','<p>The Moon shadow project is a relatively small window to be installed in an outside door. The door faces onto a lawn with a lake a short distance away. In other words there is plenty of light around so I decided to do something a bit darker and aim for an atmospheric scene.</p><br><p>What better than the moon at night?</p>',0,'img/thumbs/moon_shadow_th.jpg','img/thumbs/moon_shadow_th.jpg',1,1,'','','008080','00daff','',28,'2021-01-16 12:17:15','2021-01-16 13:23:36',NULL),(19,6.00,'Lillies','lillies','<p>Lilies seem to be a very popular subject for stained glass windows as they come up all the time. This project concerned replacing a frosted internal window with something much more interesting.<br></p>',0,'img/thumbs/lillies_th.jpg','img/thumbs/lillies_th.jpg',1,1,'','','008080','000','',28,'2021-01-16 13:42:07','2021-01-18 09:55:14',NULL),(20,4.00,'Door Lillies','doorlillies','<p>A front door project. The brief was to match existing windows beside and above the door. Luckily the next door neighbour had exactly the same designs and they conveniently allowed me to take pictures and a greaseproof paper rubbing so that I could match the traditional Victorian design, and, therefore, also have a guide when choosing the glass.</p>',0,'img/thumbs/door_lillies_th.jpg','img/thumbs/door_lillies_th.jpg',1,1,'','','008080','000','',28,'2021-01-17 10:36:25','2021-01-18 12:12:08',NULL),(21,5.00,'Canopy','canopy','<p>The Canopy project was for the reconstruction of a panel which had been mounted in a wooden frame and which acted as a shelter outside a backdoor, where the client enjoyed an evening puff on a cigarette.</p><br><p>They had had some building work done and the builders had accidentally demolished their beautiful leaded canopy. So my job was to rebuild it.</p><br><p>The design was already decided, therefore, and it remained just to draw up the template and to salvage as much of the original glass as possible.</p>',0,'img/thumbs/canopy_th.jpg','img/thumbs/canopy_th.jpg',1,1,'','','008080','000','',28,'2021-01-18 09:01:25','2021-01-18 09:01:25',NULL),(22,3.00,'Candle','candle','<p>The Candle project involved copying the design of a bay window, and setting the new window beside the bay in a front door.</p><br><p>The client had accidentally broken the window some years previously and had fitted toughened glass in its place. That didn’t look very nice, so the objective was to make the new window match the existing one.</p><br><p>We couldn’t quite make out what the design was supposed to represent. Nevertheless, we ploughed on and you can see how the new window turned out, although at the time of writing the client had not got around to actually fitting the window into the door.</p>',0,'img/thumbs/candle_th.jpg','img/thumbs/candle_th.jpg',1,1,'','','008080','000','',28,'2021-01-18 09:44:23','2021-01-18 09:55:24',NULL),(23,1.00,'Song Bird','songbird','<p>Another door project. This time a pair of traditional stained glass panels in a front door. In a house probably not far off 100 years old and the door itself beginning to feel its age.</p><br><p>At one time the panels would have been very attractive, matching and secure. One of the panels had been restored at some point in a very sloppy way. It no longer matched its partner, which was to be rebuilt because the putty had deteriorated and was mostly gone, some pieces of glass were broken or missing and all the lead was failing; it was falling apart.</p><br><p>A very interesting project because in addition to removing and rebuilding one of the panels I also had to do something about the other panel, as it no longer had a matching diamond shaped central piece.</p>',1,'img/thumbs/song_bird_th.jpg','img/thumbs/song_bird_th.jpg',1,1,'','','008080','000','',28,'2021-01-18 12:51:07','2021-01-18 13:05:04',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `templates`
--

LOCK TABLES `templates` WRITE;
/*!40000 ALTER TABLE `templates` DISABLE KEYS */;
INSERT INTO `templates` VALUES (28,'*Default template','<body style=\"background-color: ##BACKGROUND_COLOR#;\"/> <style>.template-credits-label { color: ##CREDIT_LABEL_COLOR#; } .template-credits-row-container { background-color: ##BACKGROUND_COLOR# }</style> <div class=\"template-details-title\">#TITLE#</div><div class=\'template-details-description\'>#DESCRIPTION#</div>#CONTENTS#   <!--<div class=\"template-credits-title\">credits</div> <div class=\"row template-credits-row-container\"> <div class=\"col-xs-12 col-sm-12 col-md-12 col-lg-12\"> #CREDITS#</div>-->   </div><br>','2020-02-24 11:20:08','2021-01-16 12:59:36',NULL),(29,'*About','<div class=\"about-text-title\">Welcome to Valley Glass!</div><div class=\"about-text\">Sunlight shining through glass. It may be textured, coloured or forged into interesting shapes. As you walk past, the light catches different angles and colours and the window comes alive with movement. Stained glass windows enhance walls, windows, doors and can even be free-standing. The sheer variation and beauty of this medium is why I learned how to work with stained glass and why I love doing it so much.</div>','2020-06-18 10:54:15','2021-02-11 12:19:14',NULL);
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
INSERT INTO `users` VALUES (1,'Brian','brian','betheridge@gmail.com','$2y$10$I5coxELkOeXrr7O1L/CIQu3iDmyPOWtYh9zgt49mtaHWxy..l5np.','dcd443e19e4b041168dfb5e83a52d64e',1,1,'m7BQ7IWe3gxjnP6SDCvW7g4CvsnuOyjzCf7CQUQWj9iMmFfvQH4ELzntUaHP','2016-07-17 13:51:04','2021-01-16 11:45:36',NULL),(2,'Russ','russ','contact@russelletheridge.com','$2y$10$I5coxELkOeXrr7O1L/CIQu3iDmyPOWtYh9zgt49mtaHWxy..l5np.','460a2c34e121cde19a6f7e1032db472e',1,1,'FQ6CJWmQTYCnJeDYWLXAdarL63drty1Yi8KoRcVKzOgX35d0wGRlSkxEBi4p','2016-07-17 13:51:05','2018-09-16 12:16:12',NULL),(3,'Test User','test_user','user@user.com','$2y$10$kfbDKLFLt3izY/P7L7Cjj.5Pnx.p2X..bO2fJNUaGX7MZ/5KTU/XK','49b09443042a2611da1db89544b6d4c6',1,0,NULL,'2016-07-17 13:51:05','2016-07-17 13:51:05',NULL);
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

-- Dump completed on 2021-02-11 13:11:32
