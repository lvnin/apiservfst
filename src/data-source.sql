DROP PROCEDURE IF EXISTS `set_auto_increment`;

CREATE PROCEDURE `set_auto_increment`(
	IN in_tblname varchar(255), 
	IN in_incrindex int
) 
BEGIN 
DECLARE
	total int DEFAULT 0;
	SET @stmt = CONCAT('SELECT COUNT(*) into @total from ', in_tblname);
	PREPARE stmt FROM @stmt;
	EXECUTE stmt;
	IF total = 0 THEN
		SET @stmt = CONCAT('ALTER TABLE ', in_tblname, ' AUTO_INCREMENT=', in_incrindex);
		PREPARE stmt FROM @stmt;
		EXECUTE stmt;
	END IF;
END;

CALL set_auto_increment ('users', 100000000);
