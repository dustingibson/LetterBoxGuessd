DROP TABLE IF EXISTS `MOVIES`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MOVIES` (
  `ID` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `PRIMARY_TITLE` varchar(300) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `ORIGINAL_TITLE` varchar(300) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `WEB_TITLE` varchar(300) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `VOTES` int DEFAULT NULL,
  `RATING` decimal(10,2) DEFAULT NULL,
  `DESCRIPTION` text,
  `IMAGE_URL` varchar(300) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `PROCESSED` bit(1) DEFAULT NULL,
  `FINAL_TITLE` varchar(300) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `BOX_RATING_TEXT` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `GENRE` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `GAME_DATE` datetime DEFAULT NULL,
  `UPDATE_DATE` datetime DEFAULT NULL,
  `SOURCE` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `RELEASE_YEAR` varchar(4) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`ID`),
  FULLTEXT KEY `idx_primary_title` (`PRIMARY_TITLE`),
  FULLTEXT KEY `idx_original_title` (`ORIGINAL_TITLE`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `REVIEWS`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `REVIEWS` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `MOVIE_ID` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `STARS` int DEFAULT NULL,
  `REVIEW_TEXT` text,
  `REDACTED_REVIEW_TEXT` text,
  `AUTHOR` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `LINK` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `IS_FULL` bit(1) DEFAULT NULL,
  `UPDATED_DATE` datetime DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_REVIEWS` (`MOVIE_ID`),
  CONSTRAINT `FK_REVIEWS` FOREIGN KEY (`MOVIE_ID`) REFERENCES `MOVIES` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=8121 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
