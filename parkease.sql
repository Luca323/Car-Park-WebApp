-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 30, 2025 at 05:51 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `parkease`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `add_additional_spaces` (IN `parkId` INT, IN `oldSize` INT, IN `newSize` INT)   BEGIN
    DECLARE i INT DEFAULT oldSize + 1;
    WHILE i <= newSize DO
        INSERT INTO Spaces (CarparkID, Price, Occupied, UserID)
        VALUES (parkId, 0, FALSE, NULL);
        SET i = i + 1;
    END WHILE;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `create_spaces_for_carpark` (IN `parkId` INT, IN `numSpaces` INT)   BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i <= numSpaces DO
        INSERT INTO Spaces (CarparkID, Price, Occupied, UserID)
        VALUES (parkId, 0, FALSE, NULL);
        SET i = i + 1;
    END WHILE;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `carparks`
--

CREATE TABLE `carparks` (
  `CarparkID` int(11) NOT NULL,
  `Name` varchar(20) DEFAULT NULL,
  `Size` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carparks`
--

INSERT INTO `carparks` (`CarparkID`, `Name`, `Size`) VALUES
(7513, 'testes', 30),
(9255, 'treble', 40);

--
-- Triggers `carparks`
--
DELIMITER $$
CREATE TRIGGER `trg_auto_create_spaces` AFTER INSERT ON `carparks` FOR EACH ROW BEGIN
    CALL create_spaces_for_carpark(NEW.CarparkID, NEW.Size);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_auto_expand_spaces` AFTER UPDATE ON `carparks` FOR EACH ROW BEGIN
    IF NEW.Size > OLD.Size THEN
        CALL add_additional_spaces(NEW.CarparkID, OLD.Size, NEW.Size);
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `logininfo`
--

CREATE TABLE `logininfo` (
  `UserID` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Passkey` varchar(100) NOT NULL,
  `Email` varchar(30) NOT NULL,
  `PhoneNum` varchar(15) NOT NULL,
  `CarNum` varchar(10) DEFAULT NULL,
  `Type` enum('driver','admin') NOT NULL DEFAULT 'driver'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `logininfo`
--

INSERT INTO `logininfo` (`UserID`, `Username`, `Passkey`, `Email`, `PhoneNum`, `CarNum`, `Type`) VALUES
(2169, 'Luca Harper-Daude', 'balls', 'luca-hdaude@hotmail.com', '07519990754', 'ABCDE', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `reservations`
--

CREATE TABLE `reservations` (
  `ReservationID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `SpaceID` int(11) NOT NULL,
  `startDate` date NOT NULL,
  `Arrival` time NOT NULL,
  `Departure` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `spaces`
--

CREATE TABLE `spaces` (
  `SpaceID` int(11) NOT NULL,
  `CarparkID` int(11) NOT NULL,
  `Price` int(11) NOT NULL,
  `Occupied` tinyint(1) NOT NULL,
  `UserID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `spaces`
--

INSERT INTO `spaces` (`SpaceID`, `CarparkID`, `Price`, `Occupied`, `UserID`) VALUES
(148, 7513, 0, 0, NULL),
(149, 7513, 0, 0, NULL),
(150, 7513, 0, 0, NULL),
(151, 7513, 0, 0, NULL),
(152, 7513, 0, 0, NULL),
(153, 7513, 0, 0, NULL),
(154, 7513, 0, 0, NULL),
(155, 7513, 0, 0, NULL),
(156, 7513, 0, 0, NULL),
(157, 7513, 0, 0, NULL),
(158, 7513, 0, 0, NULL),
(159, 7513, 0, 0, NULL),
(160, 7513, 0, 0, NULL),
(161, 7513, 0, 0, NULL),
(162, 7513, 0, 0, NULL),
(163, 7513, 0, 0, NULL),
(164, 7513, 0, 0, NULL),
(165, 7513, 0, 0, NULL),
(166, 7513, 0, 0, NULL),
(167, 7513, 0, 0, NULL),
(168, 7513, 0, 0, NULL),
(169, 7513, 0, 0, NULL),
(170, 7513, 0, 0, NULL),
(171, 7513, 0, 0, NULL),
(172, 7513, 0, 0, NULL),
(173, 7513, 0, 0, NULL),
(174, 7513, 0, 0, NULL),
(175, 7513, 0, 0, NULL),
(176, 7513, 0, 0, NULL),
(177, 7513, 0, 0, NULL),
(178, 9255, 0, 0, NULL),
(179, 9255, 0, 0, NULL),
(180, 9255, 0, 0, NULL),
(181, 9255, 0, 0, NULL),
(182, 9255, 0, 0, NULL),
(183, 9255, 0, 0, NULL),
(184, 9255, 0, 0, NULL),
(185, 9255, 0, 0, NULL),
(186, 9255, 0, 0, NULL),
(187, 9255, 0, 0, NULL),
(188, 9255, 0, 0, NULL),
(189, 9255, 0, 0, NULL),
(190, 9255, 0, 0, NULL),
(191, 9255, 0, 0, NULL),
(192, 9255, 0, 0, NULL),
(193, 9255, 0, 0, NULL),
(194, 9255, 0, 0, NULL),
(195, 9255, 0, 0, NULL),
(196, 9255, 0, 0, NULL),
(197, 9255, 0, 0, NULL),
(198, 9255, 0, 0, NULL),
(199, 9255, 0, 0, NULL),
(200, 9255, 0, 0, NULL),
(201, 9255, 0, 0, NULL),
(202, 9255, 0, 0, NULL),
(203, 9255, 0, 0, NULL),
(204, 9255, 0, 0, NULL),
(205, 9255, 0, 0, NULL),
(206, 9255, 0, 0, NULL),
(207, 9255, 0, 0, NULL),
(208, 9255, 0, 0, NULL),
(209, 9255, 0, 0, NULL),
(210, 9255, 0, 0, NULL),
(211, 9255, 0, 0, NULL),
(212, 9255, 0, 0, NULL),
(213, 9255, 0, 0, NULL),
(214, 9255, 0, 0, NULL),
(215, 9255, 0, 0, NULL),
(216, 9255, 0, 0, NULL),
(217, 9255, 0, 0, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carparks`
--
ALTER TABLE `carparks`
  ADD PRIMARY KEY (`CarparkID`);

--
-- Indexes for table `logininfo`
--
ALTER TABLE `logininfo`
  ADD PRIMARY KEY (`UserID`);

--
-- Indexes for table `reservations`
--
ALTER TABLE `reservations`
  ADD PRIMARY KEY (`ReservationID`),
  ADD KEY `SpaceID` (`SpaceID`),
  ADD KEY `UserID` (`UserID`);

--
-- Indexes for table `spaces`
--
ALTER TABLE `spaces`
  ADD PRIMARY KEY (`SpaceID`),
  ADD KEY `CarparkID` (`CarparkID`),
  ADD KEY `UserID` (`UserID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `spaces`
--
ALTER TABLE `spaces`
  MODIFY `SpaceID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=218;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`SpaceID`) REFERENCES `spaces` (`SpaceID`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `logininfo` (`UserID`) ON DELETE CASCADE;

--
-- Constraints for table `spaces`
--
ALTER TABLE `spaces`
  ADD CONSTRAINT `spaces_ibfk_1` FOREIGN KEY (`CarparkID`) REFERENCES `carparks` (`CarparkID`) ON DELETE CASCADE,
  ADD CONSTRAINT `spaces_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `logininfo` (`UserID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
