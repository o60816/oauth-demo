--
-- Table structure for table `users`
--
CREATE DATABASE oauth_demo;
USE oauth_demo;

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int auto_increment unique NOT NULL,
  `name` varchar(64) NOT NULL,
  `password` varchar(64) DEFAULT NULL,
  `email` text unique NOT NULL,
  `created_at` timestamp default current_timestamp,
  PRIMARY KEY (`id`)
);

GRANT ALL on oauth_demo.* TO `admin`;