-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 28, 2025 at 03:15 PM
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

-- --------------------------------------------------------

--
-- Table structure for table `carpark`
--

CREATE TABLE `carpark` (
  `SpaceID` int(11) NOT NULL,
  `Price` int(11) NOT NULL,
  `Occupied` tinyint(1) NOT NULL,
  `UserID` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `carpark`
--
DELIMITER $$
CREATE TRIGGER `check_userid_on_occupied_insert` BEFORE INSERT ON `carpark` FOR EACH ROW BEGIN
    IF NEW.Occupied = 1 AND NEW.UserID IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'UserID must be provided when space is occupied';
    END IF;

    IF NEW.Occupied = 0 AND NEW.UserID IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'UserID must be NULL when space is not occupied';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `check_userid_on_occupied_update` BEFORE UPDATE ON `carpark` FOR EACH ROW BEGIN
    IF NEW.Occupied = 1 AND NEW.UserID IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'UserID must be provided when space is occupied';
    END IF;

    IF NEW.Occupied = 0 AND NEW.UserID IS NOT NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'UserID must be NULL when space is not occupied';
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
  `CarNum` varchar(10) NOT NULL,
  `Email` varchar(30) NOT NULL,
  `Passkey` varchar(100) NOT NULL,
  `PhoneNum` varchar(15) DEFAULT NULL,
  `Type` enum('driver','admin') NOT NULL DEFAULT 'driver'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `logininfo`
--

INSERT INTO `logininfo` (`UserID`, `Username`, `CarNum`, `Email`, `Passkey`, `PhoneNum`, `Type`) VALUES
(0, 'Luca Harper-Daude', 'ABCDE', 'luca-hdaude@hotmail.com', 'Balls', '07519990754', 'driver');

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

--
-- Indexes for dumped tables
--

--
-- Indexes for table `carpark`
--
ALTER TABLE `carpark`
  ADD PRIMARY KEY (`SpaceID`),
  ADD KEY `UserID` (`UserID`);

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
-- Constraints for dumped tables
--

--
-- Constraints for table `carpark`
--
ALTER TABLE `carpark`
  ADD CONSTRAINT `carpark_ibfk_1` FOREIGN KEY (`UserID`) REFERENCES `logininfo` (`UserID`) ON DELETE CASCADE;

--
-- Constraints for table `reservations`
--
ALTER TABLE `reservations`
  ADD CONSTRAINT `reservations_ibfk_1` FOREIGN KEY (`SpaceID`) REFERENCES `carpark` (`SpaceID`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservations_ibfk_2` FOREIGN KEY (`UserID`) REFERENCES `logininfo` (`UserID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
