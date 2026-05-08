-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 07, 2026 at 08:06 PM
-- Server version: 11.4.10-MariaDB
-- PHP Version: 8.4.20

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `applyboardafrica_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `user_type` enum('admin','agent','client','system') NOT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `user_type`, `action`, `entity_type`, `entity_id`, `description`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 3, 'client', 'case_created', 'case', 1, 'Case CS-2025-E0BACE created', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-26 00:05:02'),
(2, 3, 'client', 'case_created', 'case', 2, 'Case CS-2025-741A0D created', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-26 00:06:15'),
(3, 3, 'client', 'case_created', 'case', 3, 'Case CS-2025-50A05F created', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-26 00:07:01'),
(4, 3, 'client', 'case_created', 'case', 4, 'Case CS-2025-C5C623 created', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-26 00:10:20'),
(5, 3, 'client', 'document_uploaded', 'document', 1, 'Document 1766704220_testFile.png uploaded', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-26 00:10:20'),
(6, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-30 17:39:26'),
(7, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-30 18:07:14'),
(8, 4, 'client', 'case_created', 'case', 5, 'Case CS-2025-285CB4 created', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 10:00:34'),
(9, 4, 'client', 'document_uploaded', 'document', 2, 'Document 1767171634_University Assembly Flyer.jpeg uploaded', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 10:00:34'),
(10, 4, 'client', 'case_created', 'case', 6, 'Case CS-2025-A87274 created', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 11:14:34'),
(11, 1, 'admin', 'case_stage_updated', 'case', 6, 'Case CS-2025-A87274 moved from assessment to offer', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 11:35:41'),
(12, 1, 'admin', 'case_stage_updated', 'case', 6, 'Case CS-2025-A87274 moved from offer to completed', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 11:35:49'),
(13, 1, 'admin', 'case_stage_updated', 'case', 6, 'Case CS-2025-A87274 moved from completed to travel', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 11:43:36'),
(14, 1, 'admin', 'case_stage_updated', 'case', 6, 'Case CS-2025-A87274 moved from travel to completed', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 11:43:41'),
(15, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2025-12-31 13:45:13'),
(16, 1, 'admin', 'case_created', 'case', 7, 'Case CS-2026-A3D5DB created', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-01 23:06:50'),
(17, 1, 'admin', 'case_stage_updated', 'case', 5, 'Case CS-2025-285CB4 moved from assessment to documents', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 09:36:16'),
(18, 1, 'admin', 'case_stage_updated', 'case', 5, 'Case CS-2025-285CB4 moved from documents to submission', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 09:36:41'),
(19, 1, 'admin', 'case_stage_updated', 'case', 5, 'Case CS-2025-285CB4 moved from submission to decision', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 09:36:55'),
(20, 1, 'admin', 'case_stage_updated', 'case', 5, 'Case CS-2025-285CB4 moved from decision to completed', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 09:37:04'),
(21, 1, 'admin', 'case_stage_updated', 'case', 5, 'Case CS-2025-285CB4 moved from completed to closed', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 09:37:28'),
(22, 1, 'admin', 'document_verified', 'document', 2, 'Document marked as verified', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-02 09:37:38'),
(23, 1, 'admin', 'update', 'case_type', 3, 'Updated case type: Tourist Visa', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-15 16:44:37'),
(24, 1, 'admin', 'create', 'case_type', 9, 'Created case type: Fallon Pratt', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-15 16:47:45'),
(25, 1, 'admin', 'delete', 'case_type', 9, 'Deleted case type: Fallon Pratt', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-15 16:48:01'),
(26, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-15 16:49:02'),
(27, 4, 'client', 'case_created', 'case', 8, 'Case CS-2026-817A1B created', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-15 17:01:28'),
(28, 4, 'client', 'payment', 'payment', 5, 'Paid ₦35,000.00 for Tourist Visa', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-15 17:01:28'),
(29, 1, 'admin', 'create', 'staff', 1, 'Created staff: Heather Walls', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-15 17:37:12'),
(30, 1, 'admin', 'agent_approve', 'agent', 2, 'Agent status changed to verified', '102.88.113.160', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-17 19:37:28'),
(31, 1, 'admin', 'agent_approve', 'agent', 3, 'Agent status changed to verified', '102.88.113.160', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-17 19:37:40'),
(32, 1, 'admin', 'agent_approve', 'agent', 4, 'Agent status changed to verified', '102.88.113.160', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-17 19:37:48'),
(33, 1, 'admin', 'create', 'service', 1, 'Added service: AUSTRALIA Certificate III Training Pathway', '102.88.113.160', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-17 19:40:14'),
(34, 1, 'admin', 'create', 'staff', 2, 'Created staff: dominique', '102.88.113.160', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-17 19:55:15'),
(35, 1, 'admin', 'create', 'case_type', 10, 'Created case type: Idona Garcia', '102.91.4.132', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-18 14:17:06'),
(36, 1, 'admin', 'delete', 'case_type', 10, 'Deleted case type: Idona Garcia', '102.91.4.132', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-18 14:17:19'),
(37, 1, 'admin', 'create', 'service', 2, 'Added service: Kyla James', '102.91.4.132', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-18 14:26:34'),
(38, 1, 'admin', 'delete', 'service', 2, 'Deleted service ID: 2', '102.91.4.132', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-18 14:26:49'),
(39, 1, 'admin', 'create', 'case_type', 11, 'Created case type: Scholarship', '105.113.73.144', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-18 15:13:20'),
(40, 1, 'admin', 'update', 'case_type', 11, 'Updated case type: Scholarship', '105.113.73.144', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-18 15:27:25'),
(41, 1, 'admin', 'update', 'case_type', 7, 'Updated case type: Student Loan', '105.113.73.144', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-18 15:28:02'),
(42, 1, 'admin', 'update', 'case_type', 3, 'Updated case type: Tourist Visa', '105.113.73.144', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-18 15:28:20'),
(43, 1, 'admin', 'update', 'case_type', 2, 'Updated case type: Student Visa', '105.113.73.144', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-18 15:28:36'),
(44, 1, 'admin', 'update', 'case_type', 1, 'Updated case type: Study Abroad', '105.113.73.144', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-18 15:28:54'),
(45, 1, 'admin', 'update', 'case_type', 4, 'Updated case type: Family Visa', '105.113.73.144', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-18 15:29:18'),
(46, 1, 'admin', 'update', 'case_type', 5, 'Updated case type: Travel Booking', '105.113.73.144', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-18 15:29:34'),
(47, 1, 'admin', 'update', 'case_type', 6, 'Updated case type: Pilgrimage', '105.113.73.144', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-18 15:29:57'),
(48, 1, 'admin', 'update', 'staff', 2, 'Updated staff: dominique', '105.113.73.144', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-18 15:30:58'),
(49, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '105.113.73.144', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0', '2026-01-18 15:39:45'),
(50, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '105.113.99.129', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-01-19 11:59:05'),
(51, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '105.113.94.61', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-01-20 12:28:08'),
(52, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '105.113.94.61', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-01-20 12:28:30'),
(53, 1, 'admin', 'agent_approve', 'agent', 6, 'Agent status changed to verified', '105.113.94.61', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-01-20 12:28:58'),
(54, 1, 'admin', 'agent_approve', 'agent', 5, 'Agent status changed to verified', '105.113.94.61', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-01-20 12:29:28'),
(55, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '105.113.94.61', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-01-20 12:46:30'),
(56, 9, 'client', 'case_created', 'case', 9, 'Case CS-2026-6D7AB6 created', '105.113.102.112', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-21 17:59:19'),
(57, 9, 'client', 'payment', 'payment', 11, 'Paid â‚¦100.00 for Study Abroad', '105.113.102.112', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36', '2026-01-21 17:59:19'),
(58, 1, 'admin', 'agent_approve', 'agent', 7, 'Agent status changed to verified', '105.113.102.112', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-21 18:31:22'),
(59, 1, 'admin', 'agent_approve', 'agent', 7, 'Agent status changed to verified', '105.113.102.112', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-21 18:31:28'),
(60, 1, 'admin', 'agent_approve', 'agent', 8, 'Agent status changed to verified', '105.113.102.112', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-21 18:49:29'),
(61, 7, 'agent', 'client_referred', 'user', 0, 'New client registered via referral link', NULL, NULL, '2026-01-21 19:06:21'),
(62, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '105.113.109.151', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-22 11:17:29'),
(63, 1, 'admin', 'update', 'settings', NULL, 'Updated system settings', '105.113.109.151', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-22 11:17:44'),
(64, 1, 'admin', 'update', 'settings', NULL, 'Updated system settings', '105.113.109.151', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-22 11:18:15'),
(65, 1, 'admin', 'create', 'case_type', 12, 'Created case type: Australia & New Zealand Cert III', '105.113.109.151', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-22 12:04:23'),
(66, 1, 'admin', 'update', 'settings', NULL, 'Updated system settings', '105.113.81.74', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-22 19:32:33'),
(67, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '105.113.81.74', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-22 19:32:57'),
(68, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '105.113.81.74', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-22 19:34:35'),
(69, 1, 'admin', 'create', 'case_type', 13, 'Created case type: Research Proposals', '105.113.81.74', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-22 19:36:18'),
(70, 1, 'admin', 'create', 'case_type', 14, 'Created case type: VHS service fees($288)', '105.113.81.74', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-22 19:39:38'),
(71, 7, 'agent', 'client_referred', 'user', 0, 'New client registered via referral link', NULL, NULL, '2026-01-23 11:45:56'),
(72, 7, 'agent', 'client_referred', 'user', 0, 'New client registered via referral link', NULL, NULL, '2026-01-23 12:08:21'),
(73, 7, 'agent', 'client_referred', 'user', 0, 'New client registered via referral link', NULL, NULL, '2026-01-23 12:16:41'),
(74, 7, 'agent', 'client_referred', 'user', 0, 'New client registered via referral link', NULL, NULL, '2026-01-23 12:32:36'),
(75, 7, 'agent', 'client_referred', 'user', 0, 'New client registered via referral link', NULL, NULL, '2026-01-23 12:56:13'),
(76, 1, 'admin', 'agent_approve', 'agent', 9, 'Agent status changed to verified', '102.88.109.144', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-23 13:09:43'),
(77, 7, 'agent', 'client_referred', 'user', 0, 'New client registered via referral link', NULL, NULL, '2026-01-23 13:14:42'),
(78, 9, 'agent', 'client_referred', 'user', 0, 'New client registered via referral link', NULL, NULL, '2026-01-23 14:04:06'),
(79, 38, 'client', 'case_created', 'case', 10, 'Case CS-2026-CBFCBE created', '105.112.209.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-23 14:10:52'),
(80, 38, 'client', 'payment', 'payment', 12, 'Paid â‚¦100.00 for Other Services', '105.112.209.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-23 14:10:52'),
(81, 41, 'client', 'case_created', 'case', 11, 'Case CS-2026-B856D5 created', '105.112.209.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-23 14:39:23'),
(82, 41, 'client', 'payment', 'payment', 13, 'Paid â‚¦100.00 for Other Services', '105.112.209.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-23 14:39:23'),
(83, 39, 'client', 'case_created', 'case', 12, 'Case CS-2026-D2A2E4 created', '105.112.209.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-23 15:26:05'),
(84, 39, 'client', 'payment', 'payment', 14, 'Paid â‚¦100.00 for Other Services', '105.112.209.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-23 15:26:05'),
(85, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '102.89.47.69', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-23 19:47:18'),
(86, 44, 'client', 'case_created', 'case', 13, 'Case CS-2026-7844B0 created', '105.112.222.97', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-25 23:06:15'),
(87, 44, 'client', 'payment', 'payment', 15, 'Paid â‚¦100.00 for Other Services', '105.112.222.97', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-25 23:06:15'),
(88, 43, 'client', 'case_created', 'case', 14, 'Case CS-2026-E6A682 created', '105.112.222.97', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-25 23:15:58'),
(89, 43, 'client', 'payment', 'payment', 16, 'Paid â‚¦100.00 for Other Services', '105.112.222.97', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-25 23:15:58'),
(90, 40, 'client', 'case_created', 'case', 15, 'Case CS-2026-5B2C1C created', '105.112.222.97', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-25 23:34:13'),
(91, 40, 'client', 'payment', 'payment', 17, 'Paid â‚¦100.00 for Other Services', '105.112.222.97', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-25 23:34:13'),
(92, 1, 'admin', 'agent_approve', 'agent', 10, 'Agent status changed to verified', '102.88.113.175', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-01-27 19:00:41'),
(93, 1, 'admin', 'document_uploaded', 'document', 3, 'Document 1769900894_passport data page.pdf uploaded', '102.89.46.94', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-02-01 00:08:14'),
(94, 1, 'admin', 'document_uploaded', 'document', 3, 'Document uploaded for case CS-2026-5B2C1C', '102.89.46.94', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-02-01 00:08:14'),
(95, 1, 'admin', 'document_verified', 'document', 3, 'Document marked as verified', '102.89.46.94', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36', '2026-02-01 00:08:24'),
(96, 45, 'client', 'case_created', 'case', 16, 'Case CS-2026-FD38F3 created', '102.91.77.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-11 09:10:08'),
(97, 45, 'client', 'payment', 'payment', 18, 'Paid â‚¦100.00 for Other Services', '102.91.77.30', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36 Edg/144.0.0.0', '2026-02-11 09:10:10'),
(98, 9, 'agent', 'client_referred', 'user', 0, 'New client registered via referral link', NULL, NULL, '2026-02-11 11:45:45'),
(99, 1, 'admin', 'agent_approve', 'agent', 11, 'Agent status changed to verified', '102.88.113.214', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-11 13:38:41'),
(100, 1, 'admin', 'create', 'staff', 3, 'Created staff: Titilayo Oluwatomiwa', '102.89.34.122', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-12 16:12:56'),
(101, 1, 'admin', 'agent_approve', 'agent', 12, 'Agent status changed to verified', '102.89.34.122', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36', '2026-02-12 23:19:25'),
(102, 1, 'admin', 'agent_approve', 'agent', 13, 'Agent status changed to verified', '102.88.109.152', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-16 14:01:14'),
(103, 1, 'admin', 'document_uploaded', 'document', 4, 'Document 1771618579_Joy Bisong International Passport.pdf uploaded', '102.89.47.114', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 21:16:19'),
(104, 1, 'admin', 'document_uploaded', 'document', 4, 'Document uploaded for case CS-2026-FD38F3', '102.89.47.114', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 21:16:19'),
(105, 1, 'admin', 'document_verified', 'document', 4, 'Document marked as verified', '102.89.47.114', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 21:16:33'),
(106, 1, 'admin', 'document_verified', 'document', 4, 'Document marked as verified', '102.89.47.114', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 21:16:50'),
(107, 1, 'admin', 'document_uploaded', 'document', 5, 'Document 1771618633_Bisong Joy  Mres CV.pdf uploaded', '102.89.47.114', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 21:17:13'),
(108, 1, 'admin', 'document_uploaded', 'document', 5, 'Document uploaded for case CS-2026-FD38F3', '102.89.47.114', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 21:17:13'),
(109, 1, 'admin', 'case_status_updated', 'case', 16, 'Case status changed to completed', '102.89.47.114', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 21:17:31'),
(110, 1, 'admin', 'document_verified', 'document', 5, 'Document marked as verified', '102.89.47.114', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 21:18:01'),
(111, 1, 'admin', 'case_stage_updated', 'case', 16, 'Case CS-2026-FD38F3 moved from assessment to processing', '102.89.47.114', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-20 21:19:06'),
(112, 1, 'admin', 'update', 'staff', 3, 'Updated staff: Titilayo Oluwatomiwa', '102.88.115.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-24 11:52:46'),
(113, 1, 'admin', 'update', 'staff', 3, 'Updated staff: Titilayo Oluwatomiwa', '102.88.115.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-24 11:54:37'),
(114, 1, 'admin', 'update', 'staff', 3, 'Updated staff: Titilayo Oluwatomiwa', '102.88.115.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-24 11:57:17'),
(115, 1, 'admin', 'update', 'staff', 3, 'Updated staff: Titilayo Oluwatomiwa', '102.88.115.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-24 11:57:57'),
(116, 1, 'admin', 'update', 'staff', 3, 'Updated staff: Titilayo Oluwatomiwa', '102.88.115.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-24 11:58:42'),
(117, 1, 'admin', 'update', 'staff', 3, 'Updated staff: Titilayo Oluwatomiwa', '102.88.115.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-24 11:59:25'),
(118, 1, 'admin', 'document_verified', 'document', 4, 'Document marked as verified', '102.88.115.39', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-24 12:03:01'),
(119, 1, 'admin', 'create', 'staff', 4, 'Created staff: Titilayo Oluwatomiwa Emmanuel', '102.88.110.232', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-27 14:57:54'),
(120, 1, 'admin', 'update', 'staff', 4, 'Updated staff: Titilayo Oluwatomiwa Emmanuel', '102.88.110.232', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-27 14:58:36'),
(121, 12, 'agent', 'client_referred', 'user', 0, 'New client registered via referral link', NULL, NULL, '2026-02-27 16:13:54'),
(122, 1, 'admin', 'create', 'case_type', 15, 'Created case type: Study In The United Kingdom', '102.88.110.232', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-27 16:21:26'),
(123, 1, 'admin', 'update', 'case_type', 1, 'Updated case type: Study Abroad', '102.88.110.232', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-27 16:23:02'),
(124, 1, 'admin', 'update', 'case_type', 2, 'Updated case type: Student Visa', '102.88.110.232', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-27 16:23:13'),
(125, 1, 'admin', 'update', 'case_type', 2, 'Updated case type: Student Visa', '102.88.110.232', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-27 16:23:29'),
(126, 1, 'admin', 'update', 'case_type', 2, 'Updated case type: Student Visa', '102.88.110.232', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-27 16:24:32'),
(127, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '102.88.110.232', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-27 16:25:14'),
(128, 12, 'agent', 'client_referred', 'user', 0, 'New client registered via referral link', NULL, NULL, '2026-02-27 16:27:28'),
(129, 1, 'admin', 'case_created', 'case', 17, 'Case CS-2026-94A9E2 created', '102.88.110.232', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-27 16:28:57'),
(130, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '102.88.110.232', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-27 16:33:28'),
(131, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '102.88.110.232', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-27 16:33:30'),
(132, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '102.88.110.232', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-02-27 16:34:07'),
(133, 12, 'agent', 'client_referred', 'user', 0, 'New client registered via referral link', NULL, NULL, '2026-03-02 10:29:37'),
(134, 1, 'admin', 'update', 'settings', NULL, 'Updated case type pricing', '102.89.22.78', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-04 11:52:26'),
(135, 1, 'admin', 'case_status_updated', 'case', 17, 'Case status changed to completed', '102.89.22.78', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-04 11:59:54'),
(136, 1, 'admin', 'case_stage_updated', 'case', 9, 'Case CS-2026-6D7AB6 moved from assessment to options', '102.89.22.78', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-04 12:04:43'),
(137, 1, 'admin', 'case_status_updated', 'case', 9, 'Case status changed to on_hold', '102.89.22.78', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36', '2026-03-04 12:04:52'),
(138, 1, 'admin', 'agent_approve', 'agent', 14, 'Agent status changed to verified', '102.88.114.243', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-03-24 22:50:32'),
(139, NULL, 'admin', 'agent_reject', 'agent', 6, 'Agent status changed to rejected', '40.77.167.121', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-03-30 07:50:05'),
(140, NULL, 'admin', 'agent_reject', 'agent', 3, 'Agent status changed to rejected', '40.77.167.63', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-03-31 21:49:58'),
(141, NULL, 'admin', 'agent_reject', 'agent', 8, 'Agent status changed to rejected', '52.167.144.166', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-01 04:26:49'),
(142, NULL, 'admin', 'agent_reject', 'agent', 13, 'Agent status changed to rejected', '40.77.167.25', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-01 05:29:26'),
(143, NULL, 'admin', 'agent_reject', 'agent', 12, 'Agent status changed to rejected', '40.77.167.116', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-01 06:10:15'),
(144, NULL, 'admin', 'agent_reject', 'agent', 10, 'Agent status changed to rejected', '40.77.167.55', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-01 06:57:14'),
(145, NULL, 'admin', 'agent_reject', 'agent', 7, 'Agent status changed to rejected', '52.167.144.191', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-01 07:10:36'),
(146, NULL, 'admin', 'agent_reject', 'agent', 11, 'Agent status changed to rejected', '40.77.167.14', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-01 07:49:55'),
(147, NULL, 'admin', 'agent_reject', 'agent', 5, 'Agent status changed to rejected', '40.77.167.14', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-01 07:53:05'),
(148, NULL, 'admin', 'agent_reject', 'agent', 9, 'Agent status changed to rejected', '52.167.144.214', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-01 08:34:59'),
(149, NULL, 'admin', 'agent_reject', 'agent', 2, 'Agent status changed to rejected', '52.167.144.175', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-01 09:10:42'),
(150, NULL, 'admin', 'agent_approve', 'agent', 6, 'Agent status changed to verified', '52.167.144.206', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-01 09:14:23'),
(151, NULL, 'admin', 'agent_reject', 'agent', 1, 'Agent status changed to rejected', '52.167.144.173', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-01 10:52:29'),
(152, NULL, 'admin', 'agent_approve', 'agent', 3, 'Agent status changed to verified', '52.167.144.182', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-01 13:21:06'),
(153, NULL, 'admin', 'agent_approve', 'agent', 13, 'Agent status changed to verified', '52.167.144.204', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-01 20:59:50'),
(154, NULL, 'admin', 'agent_approve', 'agent', 9, 'Agent status changed to verified', '40.77.167.26', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-02 00:55:32'),
(155, NULL, 'admin', 'agent_reject', 'agent', 6, 'Agent status changed to rejected', '157.55.39.59', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-02 02:00:10'),
(156, NULL, 'admin', 'agent_reject', 'agent', 13, 'Agent status changed to rejected', '157.55.39.49', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-02 02:26:01'),
(157, NULL, 'admin', 'agent_approve', 'agent', 10, 'Agent status changed to verified', '157.55.39.197', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-02 05:28:41'),
(158, NULL, 'admin', 'agent_reject', 'agent', 8, 'Agent status changed to rejected', '52.167.144.210', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-02 08:20:16'),
(159, NULL, 'admin', 'agent_approve', 'agent', 5, 'Agent status changed to verified', '157.55.39.10', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-02 16:29:43'),
(160, NULL, 'admin', 'agent_reject', 'agent', 6, 'Agent status changed to rejected', '40.77.167.14', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-02 18:26:05'),
(161, NULL, 'admin', 'agent_reject', 'agent', 13, 'Agent status changed to rejected', '52.167.144.169', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-02 18:48:07'),
(162, NULL, 'admin', 'agent_reject', 'agent', 3, 'Agent status changed to rejected', '157.55.39.10', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-02 19:22:49'),
(163, NULL, 'admin', 'agent_approve', 'agent', 1, 'Agent status changed to verified', '52.167.144.220', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-02 20:55:49'),
(164, NULL, 'admin', 'agent_approve', 'agent', 6, 'Agent status changed to verified', '40.77.167.230', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-02 21:10:11'),
(165, NULL, 'admin', 'agent_reject', 'agent', 6, 'Agent status changed to rejected', '40.77.167.8', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-02 22:49:10'),
(166, NULL, 'admin', 'agent_reject', 'agent', 13, 'Agent status changed to rejected', '52.167.144.206', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-02 23:19:12'),
(167, NULL, 'admin', 'case_status_updated', 'case', 8, 'Case status changed to cancelled', '52.167.144.182', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 00:37:50'),
(168, NULL, 'admin', 'case_status_updated', 'case', 8, 'Case status changed to completed', '40.77.167.47', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 00:38:20'),
(169, NULL, 'admin', 'case_status_updated', 'case', 8, 'Case status changed to cancelled', '20.15.133.162', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 00:52:39'),
(170, NULL, 'admin', 'agent_approve', 'agent', 13, 'Agent status changed to verified', '157.55.39.204', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 03:19:27'),
(171, NULL, 'admin', 'agent_reject', 'agent', 1, 'Agent status changed to rejected', '40.77.167.41', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 03:58:59'),
(172, NULL, 'admin', 'case_status_updated', 'case', 12, 'Case status changed to completed', '157.55.39.197', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 04:30:32'),
(173, NULL, 'admin', 'case_status_updated', 'case', 12, 'Case status changed to cancelled', '157.55.39.197', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 04:30:34'),
(174, NULL, 'admin', 'case_status_updated', 'case', 12, 'Case status changed to on_hold', '52.167.144.184', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 04:30:42'),
(175, NULL, 'admin', 'agent_approve', 'agent', 3, 'Agent status changed to verified', '157.55.39.60', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 05:13:35'),
(176, NULL, 'admin', 'agent_reject', 'agent', 3, 'Agent status changed to rejected', '157.55.39.54', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 06:02:49'),
(177, NULL, 'admin', 'agent_reject', 'agent', 8, 'Agent status changed to rejected', '52.167.144.213', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 07:43:00'),
(178, NULL, 'admin', 'case_status_updated', 'case', 13, 'Case status changed to cancelled', '52.167.144.174', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 09:06:19'),
(179, NULL, 'admin', 'case_status_updated', 'case', 13, 'Case status changed to completed', '52.167.144.137', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 09:06:20'),
(180, NULL, 'admin', 'agent_reject', 'agent', 2, 'Agent status changed to rejected', '40.77.167.25', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 09:19:40'),
(181, NULL, 'admin', 'case_status_updated', 'case', 5, 'Case status changed to cancelled', '40.77.167.151', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 09:28:53'),
(182, NULL, 'admin', 'case_status_updated', 'case', 5, 'Case status changed to completed', '40.77.167.151', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 09:28:54'),
(183, NULL, 'admin', 'case_status_updated', 'case', 5, 'Case status changed to on_hold', '157.55.39.53', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 09:28:59'),
(184, NULL, 'admin', 'case_status_updated', 'case', 14, 'Case status changed to completed', '40.77.167.156', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 09:52:33'),
(185, NULL, 'admin', 'case_status_updated', 'case', 14, 'Case status changed to on_hold', '40.77.167.156', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 09:52:36'),
(186, NULL, 'admin', 'case_status_updated', 'case', 14, 'Case status changed to cancelled', '52.167.144.17', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 09:52:43'),
(187, NULL, 'admin', 'agent_reject', 'agent', 10, 'Agent status changed to rejected', '52.167.144.233', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 10:23:45'),
(188, NULL, 'admin', 'agent_reject', 'agent', 5, 'Agent status changed to rejected', '40.77.167.116', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 10:29:46'),
(189, NULL, 'admin', 'agent_reject', 'agent', 7, 'Agent status changed to rejected', '157.55.39.53', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 10:39:03'),
(190, NULL, 'admin', 'case_status_updated', 'case', 16, 'Case status changed to on_hold', '40.77.167.143', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 10:50:28'),
(191, NULL, 'admin', 'case_status_updated', 'case', 16, 'Case status changed to completed', '40.77.167.143', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 10:50:29'),
(192, NULL, 'admin', 'case_status_updated', 'case', 16, 'Case status changed to cancelled', '40.77.167.143', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 10:50:29'),
(193, NULL, 'admin', 'agent_approve', 'agent', 9, 'Agent status changed to verified', '52.167.144.157', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 12:08:56'),
(194, NULL, 'admin', 'agent_approve', 'agent', 6, 'Agent status changed to verified', '52.167.144.199', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 13:48:16'),
(195, NULL, 'admin', 'agent_reject', 'agent', 6, 'Agent status changed to rejected', '52.167.144.224', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 15:28:15'),
(196, NULL, 'admin', 'agent_reject', 'agent', 13, 'Agent status changed to rejected', '40.77.167.15', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 16:00:27'),
(197, NULL, 'admin', 'agent_approve', 'agent', 13, 'Agent status changed to verified', '157.55.39.7', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 20:02:56'),
(198, NULL, 'admin', 'agent_reject', 'agent', 8, 'Agent status changed to rejected', '40.77.167.155', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-03 22:15:23'),
(199, NULL, 'admin', 'agent_reject', 'agent', 3, 'Agent status changed to rejected', '157.55.39.204', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-04 06:53:15'),
(200, NULL, 'admin', 'agent_reject', 'agent', 1, 'Agent status changed to rejected', '52.167.144.174', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-04 09:10:47'),
(201, NULL, 'admin', 'agent_reject', 'agent', 7, 'Agent status changed to rejected', '157.55.39.195', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-04 10:12:27'),
(202, NULL, 'admin', 'agent_reject', 'agent', 8, 'Agent status changed to rejected', '40.77.167.43', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-04 15:13:55'),
(203, NULL, 'admin', 'agent_approve', 'agent', 5, 'Agent status changed to verified', '157.55.39.49', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-04 19:40:50'),
(204, NULL, 'admin', 'agent_reject', 'agent', 2, 'Agent status changed to rejected', '40.77.167.63', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-04 22:24:42'),
(205, NULL, 'admin', 'agent_reject', 'agent', 9, 'Agent status changed to rejected', '207.46.13.126', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-04 22:52:26'),
(206, NULL, 'admin', 'agent_reject', 'agent', 1, 'Agent status changed to rejected', '40.77.167.144', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 00:11:51');
INSERT INTO `activity_logs` (`id`, `user_id`, `user_type`, `action`, `entity_type`, `entity_id`, `description`, `ip_address`, `user_agent`, `created_at`) VALUES
(207, NULL, 'admin', 'agent_approve', 'agent', 6, 'Agent status changed to verified', '40.77.167.155', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 03:42:55'),
(208, NULL, 'admin', 'agent_approve', 'agent', 3, 'Agent status changed to verified', '207.46.13.154', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 04:08:17'),
(209, NULL, 'admin', 'agent_reject', 'agent', 10, 'Agent status changed to rejected', '52.167.144.216', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 04:29:17'),
(210, NULL, 'admin', 'agent_reject', 'agent', 5, 'Agent status changed to rejected', '40.77.167.76', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 06:57:15'),
(211, NULL, 'admin', 'agent_approve', 'agent', 10, 'Agent status changed to verified', '207.46.13.54', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 07:25:09'),
(212, NULL, 'admin', 'agent_approve', 'agent', 9, 'Agent status changed to verified', '40.77.167.247', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 07:47:51'),
(213, NULL, 'admin', 'agent_approve', 'agent', 13, 'Agent status changed to verified', '207.46.13.168', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 08:05:25'),
(214, NULL, 'admin', 'agent_approve', 'agent', 8, 'Agent status changed to verified', '52.167.144.233', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 08:31:09'),
(215, NULL, 'admin', 'agent_approve', 'agent', 12, 'Agent status changed to verified', '52.167.144.25', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 09:23:37'),
(216, NULL, 'admin', 'agent_approve', 'agent', 5, 'Agent status changed to verified', '207.46.13.116', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 12:19:28'),
(217, NULL, 'admin', 'agent_reject', 'agent', 13, 'Agent status changed to rejected', '52.167.144.232', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 12:28:54'),
(218, NULL, 'admin', 'agent_reject', 'agent', 2, 'Agent status changed to rejected', '40.77.167.155', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 15:00:17'),
(219, NULL, 'admin', 'agent_reject', 'agent', 9, 'Agent status changed to rejected', '157.55.39.58', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 15:27:32'),
(220, NULL, 'admin', 'agent_reject', 'agent', 1, 'Agent status changed to rejected', '40.77.167.156', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 16:50:08'),
(221, NULL, 'admin', 'agent_approve', 'agent', 11, 'Agent status changed to verified', '52.167.144.232', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 17:59:15'),
(222, NULL, 'admin', 'agent_reject', 'agent', 13, 'Agent status changed to rejected', '40.77.167.247', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 22:14:29'),
(223, NULL, 'admin', 'agent_approve', 'agent', 5, 'Agent status changed to verified', '52.167.144.195', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-05 22:40:03'),
(224, NULL, 'admin', 'agent_reject', 'agent', 13, 'Agent status changed to rejected', '40.77.167.2', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-06 09:38:16'),
(225, NULL, 'admin', 'agent_approve', 'agent', 5, 'Agent status changed to verified', '52.167.144.234', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-06 15:16:46'),
(226, NULL, 'admin', 'agent_reject', 'agent', 13, 'Agent status changed to rejected', '52.167.144.169', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-06 19:22:11'),
(227, NULL, 'admin', 'agent_reject', 'agent', 6, 'Agent status changed to rejected', '40.77.167.27', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-06 22:30:38'),
(228, NULL, 'admin', 'agent_approve', 'agent', 7, 'Agent status changed to verified', '40.77.167.49', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-06 23:23:53'),
(229, NULL, 'admin', 'agent_reject', 'agent', 13, 'Agent status changed to rejected', '40.77.167.36', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-07 05:00:19'),
(230, NULL, 'admin', 'agent_reject', 'agent', 8, 'Agent status changed to rejected', '52.167.144.19', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-07 08:29:58'),
(231, NULL, 'admin', 'agent_reject', 'agent', 7, 'Agent status changed to rejected', '52.167.144.192', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-07 08:36:57'),
(232, NULL, 'admin', 'agent_reject', 'agent', 13, 'Agent status changed to rejected', '40.77.167.24', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-07 21:50:24'),
(233, NULL, 'admin', 'agent_approve', 'agent', 15, 'Agent status changed to verified', '52.167.144.213', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-07 21:52:42'),
(234, NULL, 'admin', 'agent_reject', 'agent', 15, 'Agent status changed to rejected', '40.77.167.255', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-07 22:04:45'),
(235, NULL, 'admin', 'agent_reject', 'agent', 13, 'Agent status changed to rejected', '52.167.144.195', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-08 07:31:30'),
(236, NULL, 'admin', 'agent_reject', 'agent', 6, 'Agent status changed to rejected', '40.77.167.13', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-08 20:06:54'),
(237, NULL, 'admin', 'agent_approve', 'agent', 10, 'Agent status changed to verified', '52.167.144.193', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-08 20:17:01'),
(238, NULL, 'admin', 'agent_approve', 'agent', 2, 'Agent status changed to verified', '40.77.167.4', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-09 11:13:25'),
(239, NULL, 'admin', 'agent_approve', 'agent', 2, 'Agent status changed to verified', '20.15.133.163', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-09 11:28:25'),
(240, NULL, 'admin', 'agent_reject', 'agent', 9, 'Agent status changed to rejected', '52.167.144.169', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-09 11:35:32'),
(241, NULL, 'admin', 'agent_approve', 'agent', 5, 'Agent status changed to verified', '40.77.167.132', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-09 17:08:57'),
(242, NULL, 'admin', 'agent_reject', 'agent', 12, 'Agent status changed to rejected', '52.167.144.213', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-09 22:35:44'),
(243, NULL, 'admin', 'agent_approve', 'agent', 1, 'Agent status changed to verified', '52.167.144.180', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-10 04:03:09'),
(244, NULL, 'admin', 'agent_approve', 'agent', 15, 'Agent status changed to verified', '40.77.167.68', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-10 06:13:03'),
(245, NULL, 'admin', 'agent_approve', 'agent', 10, 'Agent status changed to verified', '40.77.167.67', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-10 12:47:44'),
(246, NULL, 'admin', 'agent_reject', 'agent', 6, 'Agent status changed to rejected', '40.77.167.79', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-10 13:03:56'),
(247, NULL, 'admin', 'agent_approve', 'agent', 7, 'Agent status changed to verified', '40.77.167.241', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-10 16:06:13'),
(248, NULL, 'admin', 'agent_approve', 'agent', 15, 'Agent status changed to verified', '52.167.144.25', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-10 20:17:57'),
(249, NULL, 'admin', 'agent_approve', 'agent', 15, 'Agent status changed to verified', '40.77.167.14', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-11 00:09:26'),
(250, NULL, 'admin', 'agent_reject', 'agent', 9, 'Agent status changed to rejected', '207.46.13.155', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-11 04:15:37'),
(251, NULL, 'admin', 'agent_reject', 'agent', 15, 'Agent status changed to rejected', '52.167.144.20', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-11 17:49:58'),
(252, NULL, 'admin', 'agent_approve', 'agent', 2, 'Agent status changed to verified', '52.167.144.147', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-12 05:31:02'),
(253, NULL, 'admin', 'agent_approve', 'agent', 10, 'Agent status changed to verified', '52.167.144.219', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-12 05:41:55'),
(254, NULL, 'admin', 'agent_reject', 'agent', 6, 'Agent status changed to rejected', '157.55.39.61', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-12 05:54:35'),
(255, NULL, 'admin', 'agent_reject', 'agent', 9, 'Agent status changed to rejected', '52.167.144.181', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-12 23:02:13'),
(256, NULL, 'admin', 'agent_approve', 'agent', 2, 'Agent status changed to verified', '52.167.144.215', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-13 09:50:19'),
(257, NULL, 'admin', 'agent_approve', 'agent', 3, 'Agent status changed to verified', '52.167.144.213', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-14 00:56:06'),
(258, NULL, 'admin', 'agent_reject', 'agent', 9, 'Agent status changed to rejected', '157.55.39.56', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-14 15:25:04'),
(259, NULL, 'admin', 'agent_reject', 'agent', 1, 'Agent status changed to rejected', '52.167.144.208', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-15 07:39:45'),
(260, NULL, 'admin', 'agent_reject', 'agent', 9, 'Agent status changed to rejected', '52.167.144.237', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-16 04:38:39'),
(261, NULL, 'admin', 'agent_approve', 'agent', 2, 'Agent status changed to verified', '157.55.39.194', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-16 13:04:49'),
(262, NULL, 'admin', 'agent_reject', 'agent', 7, 'Agent status changed to rejected', '52.167.144.206', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-17 10:31:38'),
(263, NULL, 'admin', 'case_status_updated', 'case', 11, 'Case status changed to completed', '207.46.13.18', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-22 04:55:18'),
(264, NULL, 'admin', 'agent_approve', 'agent', 10, 'Agent status changed to verified', '207.46.13.54', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-23 14:38:00'),
(265, NULL, 'admin', 'agent_reject', 'agent', 6, 'Agent status changed to rejected', '207.46.13.51', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-24 10:56:28'),
(266, NULL, 'admin', 'agent_reject', 'agent', 2, 'Agent status changed to rejected', '157.55.39.52', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-24 17:56:02'),
(267, NULL, 'admin', 'case_status_updated', 'case', 11, 'Case status changed to cancelled', '40.77.167.25', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-25 10:13:56'),
(268, NULL, 'admin', 'agent_approve', 'agent', 10, 'Agent status changed to verified', '40.77.167.51', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-25 12:04:50'),
(269, NULL, 'admin', 'agent_reject', 'agent', 15, 'Agent status changed to rejected', '40.77.167.25', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-25 14:42:46'),
(270, NULL, 'admin', 'agent_reject', 'agent', 7, 'Agent status changed to rejected', '207.46.13.153', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-25 19:42:48'),
(271, NULL, 'admin', 'agent_reject', 'agent', 5, 'Agent status changed to rejected', '48.192.92.20', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0', '2026-04-25 20:20:12'),
(272, NULL, 'admin', 'agent_reject', 'agent', 7, 'Agent status changed to rejected', '157.55.39.53', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-26 01:13:21'),
(273, NULL, 'admin', 'agent_approve', 'agent', 3, 'Agent status changed to verified', '157.55.39.48', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-26 04:08:41'),
(274, NULL, 'admin', 'agent_approve', 'agent', 11, 'Agent status changed to verified', '40.77.167.14', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-26 05:51:58'),
(275, NULL, 'admin', 'agent_approve', 'agent', 10, 'Agent status changed to verified', '207.46.13.7', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-26 11:50:39'),
(276, NULL, 'admin', 'case_status_updated', 'case', 2, 'Case status changed to completed', '207.46.13.116', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-26 15:45:52'),
(277, NULL, 'admin', 'agent_approve', 'agent', 8, 'Agent status changed to verified', '40.77.167.40', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-26 21:22:16'),
(278, NULL, 'admin', 'agent_approve', 'agent', 2, 'Agent status changed to verified', '40.77.167.16', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-27 01:08:10'),
(279, NULL, 'admin', 'case_status_updated', 'case', 15, 'Case status changed to completed', '40.77.167.56', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-27 05:01:03'),
(280, NULL, 'admin', 'agent_approve', 'agent', 11, 'Agent status changed to verified', '40.77.167.156', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-27 06:14:11'),
(281, NULL, 'admin', 'agent_reject', 'agent', 7, 'Agent status changed to rejected', '40.77.167.74', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-27 12:18:42'),
(282, NULL, 'admin', 'agent_approve', 'agent', 5, 'Agent status changed to verified', '40.77.167.230', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-27 21:38:18'),
(283, NULL, 'admin', 'agent_reject', 'agent', 2, 'Agent status changed to rejected', '207.46.13.160', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-28 05:35:36'),
(284, NULL, 'admin', 'case_status_updated', 'case', 1, 'Case status changed to completed', '207.46.13.141', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-28 06:46:48'),
(285, NULL, 'admin', 'agent_approve', 'agent', 2, 'Agent status changed to verified', '157.55.39.201', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-28 08:03:34'),
(286, NULL, 'admin', 'agent_reject', 'agent', 15, 'Agent status changed to rejected', '207.46.13.9', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-28 08:51:11'),
(287, NULL, 'admin', 'case_status_updated', 'case', 1, 'Case status changed to on_hold', '135.225.181.162', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0', '2026-04-28 09:09:46'),
(288, NULL, 'admin', 'case_status_updated', 'case', 17, 'Case status changed to cancelled', '207.46.13.126', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-28 10:08:50'),
(289, NULL, 'admin', 'case_status_updated', 'case', 17, 'Case status changed to on_hold', '157.55.39.59', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-28 10:08:53'),
(290, NULL, 'admin', 'case_status_updated', 'case', 17, 'Case status changed to completed', '40.77.167.46', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-28 10:09:45'),
(291, NULL, 'admin', 'agent_reject', 'agent', 3, 'Agent status changed to rejected', '40.77.167.48', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-28 14:27:12'),
(292, NULL, 'admin', 'case_status_updated', 'case', 2, 'Case status changed to cancelled', '40.77.167.55', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-28 23:37:13'),
(293, NULL, 'admin', 'case_status_updated', 'case', 2, 'Case status changed to on_hold', '40.77.167.35', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-28 23:37:51'),
(294, NULL, 'admin', 'agent_approve', 'agent', 2, 'Agent status changed to verified', '157.55.39.13', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-29 04:34:00'),
(295, NULL, 'admin', 'case_status_updated', 'case', 7, 'Case status changed to on_hold', '207.46.13.9', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-29 15:13:19'),
(296, NULL, 'admin', 'case_status_updated', 'case', 3, 'Case status changed to on_hold', '157.55.39.9', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-29 17:47:34'),
(297, NULL, 'admin', 'case_status_updated', 'case', 3, 'Case status changed to cancelled', '207.46.13.141', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-29 19:38:55'),
(298, NULL, 'admin', 'case_status_updated', 'case', 2, 'Case status changed to on_hold', '207.46.13.126', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-30 06:33:50'),
(299, NULL, 'admin', 'case_status_updated', 'case', 1, 'Case status changed to completed', '40.77.167.55', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-30 18:27:11'),
(300, NULL, 'admin', 'case_status_updated', 'case', 2, 'Case status changed to cancelled', '40.77.167.46', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-04-30 19:59:21'),
(301, NULL, 'admin', 'case_status_updated', 'case', 7, 'Case status changed to on_hold', '157.55.39.49', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-01 13:20:41'),
(302, NULL, 'admin', 'case_status_updated', 'case', 2, 'Case status changed to on_hold', '207.46.13.168', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-01 16:22:53'),
(303, NULL, 'admin', 'case_status_updated', 'case', 2, 'Case status changed to cancelled', '40.77.167.16', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-01 18:22:18'),
(304, NULL, 'admin', 'case_status_updated', 'case', 13, 'Case status changed to completed', '207.46.13.54', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-01 19:26:29'),
(305, NULL, 'admin', 'agent_reject', 'agent', 10, 'Agent status changed to rejected', '157.55.39.194', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-01 21:18:32'),
(306, NULL, 'admin', 'case_status_updated', 'case', 1, 'Case status changed to completed', '207.46.13.51', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-01 22:51:45'),
(307, NULL, 'admin', 'case_status_updated', 'case', 7, 'Case status changed to on_hold', '207.46.13.92', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-02 07:40:26'),
(308, NULL, 'admin', 'agent_reject', 'agent', 7, 'Agent status changed to rejected', '40.77.167.55', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-02 08:54:25'),
(309, NULL, 'admin', 'agent_reject', 'agent', 15, 'Agent status changed to rejected', '157.55.39.52', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-02 09:43:20'),
(310, NULL, 'admin', 'agent_reject', 'agent', 11, 'Agent status changed to rejected', '52.167.144.177', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-02 12:11:51'),
(311, NULL, 'admin', 'agent_approve', 'agent', 6, 'Agent status changed to verified', '52.167.144.19', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-02 13:57:36'),
(312, NULL, 'admin', 'case_status_updated', 'case', 2, 'Case status changed to cancelled', '52.167.144.230', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-02 16:51:35'),
(313, NULL, 'admin', 'agent_reject', 'agent', 2, 'Agent status changed to rejected', '40.77.167.14', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-02 17:42:42'),
(314, NULL, 'admin', 'agent_approve', 'agent', 9, 'Agent status changed to verified', '40.77.167.48', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-02 23:24:48'),
(315, NULL, 'admin', 'agent_approve', 'agent', 2, 'Agent status changed to verified', '40.77.167.47', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-03 01:32:37'),
(316, NULL, 'admin', 'agent_approve', 'agent', 13, 'Agent status changed to verified', '52.167.144.228', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-03 01:49:52'),
(317, NULL, 'admin', 'agent_approve', 'agent', 10, 'Agent status changed to verified', '40.77.167.143', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-03 23:13:26'),
(318, NULL, 'admin', 'case_status_updated', 'case', 15, 'Case status changed to cancelled', '52.167.144.211', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-03 23:17:17'),
(319, NULL, 'admin', 'agent_approve', 'agent', 2, 'Agent status changed to verified', '52.167.144.16', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-06 03:43:32'),
(320, NULL, 'admin', 'agent_approve', 'agent', 10, 'Agent status changed to verified', '52.167.144.23', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-06 10:30:03'),
(321, NULL, 'admin', 'agent_approve', 'agent', 3, 'Agent status changed to verified', '40.77.167.37', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-07 02:01:57'),
(322, NULL, 'admin', 'case_status_updated', 'case', 16, 'Case status changed to completed', '52.167.144.172', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-07 02:11:17'),
(323, NULL, 'admin', 'case_status_updated', 'case', 14, 'Case status changed to cancelled', '52.167.144.183', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-07 06:58:33'),
(324, NULL, 'admin', 'agent_approve', 'agent', 10, 'Agent status changed to verified', '52.167.144.220', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-07 09:33:42'),
(325, NULL, 'admin', 'case_status_updated', 'case', 7, 'Case status changed to completed', '40.77.167.10', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-07 11:05:05'),
(326, NULL, 'admin', 'case_status_updated', 'case', 1, 'Case status changed to cancelled', '52.167.144.214', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-07 14:37:38'),
(327, NULL, 'admin', 'case_status_updated', 'case', 6, 'Case status changed to completed', '40.77.167.151', 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36', '2026-05-07 15:48:25');

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `email` varchar(30) NOT NULL,
  `password` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `email`, `password`) VALUES
(1, 'admin@admin.com', 'admin123');

-- --------------------------------------------------------

--
-- Table structure for table `agents`
--

CREATE TABLE `agents` (
  `id` int(11) NOT NULL,
  `agent_code` varchar(50) NOT NULL,
  `fullname` varchar(150) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(30) NOT NULL,
  `status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `commission_rate` decimal(5,2) DEFAULT 0.00,
  `documents` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `slug` varchar(100) DEFAULT NULL COMMENT 'SEO-friendly agent identifier',
  `wallet_balance` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_earned` decimal(12,2) NOT NULL DEFAULT 0.00,
  `referral_count` int(11) NOT NULL DEFAULT 0,
  `performance_id` int(11) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `account_name` varchar(150) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `agents`
--

INSERT INTO `agents` (`id`, `agent_code`, `fullname`, `email`, `password`, `phone`, `status`, `commission_rate`, `documents`, `created_at`, `slug`, `wallet_balance`, `total_earned`, `referral_count`, `performance_id`, `address`, `city`, `country`, `bank_name`, `account_number`, `account_name`, `reset_token`, `reset_expires`) VALUES
(1, 'AGT-7F0E1A', 'Dominique Conrad', 'savyjug@example.com', '00000000', '+1 (117) 797-2941', 'rejected', 0.00, NULL, '2025-12-20 01:07:28', NULL, 1.70, 4000.00, 1, NULL, '', '', '', 'kuda', '2014205473', 'Vic Ike', NULL, NULL),
(2, 'AGT-480BE5', 'Nicholas Lewis', 'nic@example.com', '00000000', '+1 (608) 839-7266', 'verified', 0.00, 'agents/1768493174_2148913227.jpg', '2026-01-15 17:04:46', NULL, 0.00, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 'AGT-A6C461', 'Victor Ikechukwu', 'ikechukwuv052@gmail.com', '000000', '07065606123', 'verified', 0.00, NULL, '2026-01-15 19:42:22', NULL, 0.00, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 'AGT-426CF5', 'Kelly-Daniel Oshiogwemue', 'oshiogwemue.kelly@gmail.com', '@Honour123', '08165550448', 'verified', 0.00, 'agents/1768578046_Screenshot_20260116-163916.png', '2026-01-16 16:00:27', NULL, 0.00, 0.00, 0, NULL, 'Flat 16, Omuvwie (NEPA) Estate, Ugbeyiyi', 'Sapele', 'Nigeria', 'UBA', '1028333493', 'Learngency Ltd', NULL, NULL),
(5, 'AGT-F94787', 'Olaluwoye Mary', 'yoguntade24@gmail.com', 'Faith@123', '09059100967', 'verified', 0.00, 'agents/1768842192_17688420913205357132675519812572.jpg', '2026-01-19 17:59:48', NULL, 0.00, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'AGT-660F97', 'Nkechi Sandra Anikpe', 'elevebykechltd@gmail.com', 'Grace@2026', '09078082281', 'verified', 0.00, 'agents/1768856755_CERTIFICATE - ELEVE BY KECH LTD (1).pdf', '2026-01-19 22:03:53', NULL, 0.00, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'AGT-8972ED', 'Mama Esteetade', 'esteetadetravels@gmail.com', '08032300533', '+234 803 230 0533', 'rejected', 0.00, NULL, '2026-01-21 18:22:11', NULL, 0.00, 0.00, 7, NULL, '5, Lebanon Street ibadan ', 'Ibadan ', 'Nigeria ', 'Monie point ', '9059100967', 'Esteetade business solutions or olaluwoye Mary yemisi ', NULL, NULL),
(8, 'AGT-DE5307', 'oluwa', 'doraldinef@gmail.com', '676412704', '07063459820', 'verified', 0.00, NULL, '2026-01-21 18:49:07', NULL, 0.00, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'AGT-BAA49A', 'John Bisong', 'johnbisong4444@gmail.com', 'John@17967', '07062074421', 'verified', 0.00, 'agents/1769151131_Screenshot_20260123-075043.png', '2026-01-22 12:52:52', NULL, 0.00, 0.00, 2, NULL, 'Bwari ', 'Abuja', 'Nigeria ', 'GloParms Harved International LTD ', '7062074421', 'Moniepoint Bank ', NULL, NULL),
(10, 'AGT-2B2BFB', 'Odeyemi Olabode', 'odeyemimubarak@gmail.com', 'Brain3334_', '07032690833', 'verified', 0.00, NULL, '2026-01-27 18:21:28', NULL, 0.00, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'AGT-847D5E', 'Precious Ehiogie', 'ehiogieprecious@gmail.com', 'Ultimate@2022', '07065056424', 'rejected', 0.00, NULL, '2026-02-03 19:57:21', NULL, 0.00, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'AGT-9E88FD', 'Titilayo Oluwatomiwa', 'moveabroadlink@gmail.com', 'Nigeria@2026', '2347082502913', 'rejected', 0.00, 'agents/1770925244_nin.jpeg', '2026-02-12 16:39:48', NULL, 0.00, 0.00, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'AGT-1C8182', 'Manly Nwabueze Vincent', 'infogreentevaconsult@gmail.com', 'Nwa1979', '+2349166259520', 'verified', 0.00, NULL, '2026-02-14 17:05:20', NULL, 0.00, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'AGT-90EFB4', 'Ubong Udoka', 'ubong.udoka@digiskillsconsult.com', 'Pleasure777@@@', '+2348062556036', 'verified', 0.00, NULL, '2026-03-21 23:26:18', NULL, 0.00, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 'AGT-BC0366', 'Margaret', 'wamaitha101@gmail.com', 'Keagan12#', '0715530382', 'rejected', 0.00, 'agents/1775575852_margaret ID.pdf', '2026-04-07 16:28:26', NULL, 0.00, 0.00, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `agent_performance`
--

CREATE TABLE `agent_performance` (
  `id` int(11) NOT NULL,
  `agent_id` int(11) NOT NULL,
  `total_referrals` int(11) NOT NULL DEFAULT 0,
  `active_cases` int(11) NOT NULL DEFAULT 0,
  `completed_cases` int(11) NOT NULL DEFAULT 0,
  `total_earnings` decimal(12,2) NOT NULL DEFAULT 0.00,
  `rating_activity` decimal(3,2) DEFAULT 0.00 COMMENT 'Activity score 0-5',
  `rating_quality` decimal(3,2) DEFAULT 0.00 COMMENT 'Quality score 0-5',
  `rating_outcomes` decimal(3,2) DEFAULT 0.00 COMMENT 'Outcomes score 0-5',
  `rating_overall` decimal(3,2) DEFAULT 0.00 COMMENT 'Overall score 0-5',
  `tier` enum('bronze','silver','gold','platinum') NOT NULL DEFAULT 'bronze',
  `last_calculated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `agent_performance`
--

INSERT INTO `agent_performance` (`id`, `agent_id`, `total_referrals`, `active_cases`, `completed_cases`, `total_earnings`, `rating_activity`, `rating_quality`, `rating_outcomes`, `rating_overall`, `tier`, `last_calculated_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 2, 2, 4000.00, 1.10, 2.00, 5.00, 2.70, 'silver', '2026-01-02 09:42:27', '2025-12-30 13:52:09', '2026-01-02 09:42:27'),
(2, 2, 0, 0, 0, 0.00, 0.00, 1.00, 0.00, 0.33, 'bronze', '2026-01-15 17:11:22', '2026-01-15 17:05:03', '2026-01-15 17:11:22'),
(3, 3, 0, 0, 0, 0.00, 0.00, 1.00, 0.00, 0.33, 'bronze', '2026-01-15 20:05:23', '2026-01-15 20:05:23', '2026-01-15 20:05:23'),
(4, 4, 0, 0, 0, 0.00, 0.00, 1.00, 0.00, 0.33, 'bronze', '2026-01-16 18:19:41', '2026-01-16 16:01:54', '2026-01-16 18:19:41'),
(5, 5, 0, 0, 0, 0.00, 0.00, 1.00, 0.00, 0.33, 'bronze', '2026-01-19 18:21:21', '2026-01-19 18:00:10', '2026-01-19 18:21:21'),
(6, 6, 0, 0, 0, 0.00, 0.00, 1.00, 0.00, 0.33, 'bronze', '2026-01-19 22:07:03', '2026-01-19 22:04:38', '2026-01-19 22:07:03'),
(7, 7, 7, 6, 0, 0.00, 5.00, 1.00, 0.00, 2.00, 'bronze', '2026-02-04 18:54:09', '2026-01-21 18:22:22', '2026-02-04 18:54:09'),
(8, 8, 0, 0, 0, 0.00, 0.00, 1.00, 0.00, 0.33, 'bronze', '2026-03-04 11:50:01', '2026-01-21 18:49:11', '2026-03-04 11:50:01'),
(9, 9, 1, 1, 0, 0.00, 0.80, 1.00, 0.00, 0.60, 'bronze', '2026-02-11 11:39:39', '2026-01-22 12:53:51', '2026-02-11 11:39:39'),
(10, 10, 0, 0, 0, 0.00, 0.00, 1.00, 0.00, 0.33, 'bronze', '2026-01-27 18:26:03', '2026-01-27 18:26:03', '2026-01-27 18:26:03'),
(11, 11, 0, 0, 0, 0.00, 0.00, 1.00, 0.00, 0.33, 'bronze', '2026-02-03 19:57:39', '2026-02-03 19:57:39', '2026-02-03 19:57:39'),
(12, 12, 3, 0, 0, 0.00, 1.50, 1.00, 0.00, 0.83, 'bronze', '2026-04-07 11:46:23', '2026-02-12 16:40:52', '2026-04-07 11:46:23'),
(13, 13, 0, 0, 0, 0.00, 0.00, 1.00, 0.00, 0.33, 'bronze', '2026-02-14 17:08:15', '2026-02-14 17:05:59', '2026-02-14 17:08:15'),
(14, 15, 0, 0, 0, 0.00, 0.00, 1.00, 0.00, 0.33, 'bronze', '2026-04-07 17:57:53', '2026-04-07 16:28:49', '2026-04-07 17:57:53');

-- --------------------------------------------------------

--
-- Table structure for table `blog_categories`
--

CREATE TABLE `blog_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blog_categories`
--

INSERT INTO `blog_categories` (`id`, `name`, `slug`, `description`, `created_at`) VALUES
(1, 'General', 'general', 'General blog posts', '2026-01-15 15:45:32'),
(2, 'Study', 'study', 'Study abroad', '2026-01-15 15:55:36');

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `excerpt` text DEFAULT NULL,
  `featured_image` varchar(500) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `status` enum('draft','published','archived') NOT NULL DEFAULT 'draft',
  `featured` enum('yes','no') NOT NULL DEFAULT 'no',
  `views` int(11) NOT NULL DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `title`, `slug`, `content`, `excerpt`, `featured_image`, `category_id`, `status`, `featured`, `views`, `meta_title`, `meta_description`, `created_by`, `created_at`, `updated_at`) VALUES
(5, 'Study in UK', 'study-in-uk', 'study', '', 'images/blog/1768676543_university of Hall.png', 2, 'published', 'no', 76, NULL, NULL, 1, '2026-01-17 20:02:23', '2026-05-04 18:43:44'),
(6, 'Monthend Promotion', 'monthend-promotion', 'Scholarship, loan, low tuition', '', 'images/blog/1768746839_ChatGPT Image Jan 18, 2026, 12_51_18 AM.png', 2, 'published', 'no', 76, 'scholarships; Loan; Low Tuition', 'fully funded scholarship, study loan', 1, '2026-01-18 15:33:59', '2026-05-02 14:05:06'),
(7, 'WE are Hiring', 'we-are-hiring', 'Jobs', '', 'images/blog/1769042154_ChatGPT Image Jan 22, 2026, 01_33_05 AM.png', 1, 'published', 'no', 77, 'jobs: We are Hiring, remote jobs', NULL, 1, '2026-01-22 01:35:54', '2026-05-07 00:03:08'),
(8, 'ðŸ‡¨ðŸ‡¦ Study in Canada Without Application Fees â€“ September 2026 & January 2027', 'study-in-canada-without-application-fees-september-2026-january-2027', 'ðŸ‡¨ðŸ‡¦ Study in Canada Without Application Fees â€“ September 2026 & January 2027\r\nApply to Lakehead University, Trent University, and University of New Brunswick with 100% Application Fee Waiver.\r\nIf you have your CAD 2,000 deposit ready (â‚¦2 Million), this is your chance to secure admission and access student loan support.\r\nLimited slots available. Serious applicants only.\r\nðŸ“© Send â€œCANADA 2026â€ now to check your eligibility and apply.\r\nAlternative low-tuition scholarship options in Malaysia with Australia pathway also available.\r\nApplyBoard Africa\r\nYour trusted partner for global education.', '', 'images/blog/1772630411_ssssss.jpeg', 2, 'published', 'no', 51, 'application fee waiver', 'study in canada', 1, '2026-03-04 14:20:11', '2026-05-04 21:35:37');

-- --------------------------------------------------------

--
-- Table structure for table `cases`
--

CREATE TABLE `cases` (
  `id` int(11) NOT NULL,
  `case_number` varchar(50) NOT NULL,
  `client_id` int(11) NOT NULL,
  `agent_id` int(11) DEFAULT NULL,
  `case_type` enum('study_abroad','visa_student','visa_tourist','visa_family','travel_booking','pilgrimage','student_loan','other') NOT NULL,
  `stage` enum('assessment','options','application','submission','offer','visa','travel','booking','completed','closed','documents','decision','requirements','processing') NOT NULL DEFAULT 'assessment',
  `status` enum('active','on_hold','cancelled','completed') NOT NULL DEFAULT 'active',
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `destination_country` varchar(100) DEFAULT NULL,
  `institution` varchar(255) DEFAULT NULL,
  `program` varchar(255) DEFAULT NULL,
  `intake` varchar(50) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT 0.00,
  `commission_amount` decimal(12,2) DEFAULT 0.00,
  `commission_paid` enum('pending','partial','paid') NOT NULL DEFAULT 'pending',
  `assigned_to` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cases`
--

INSERT INTO `cases` (`id`, `case_number`, `client_id`, `agent_id`, `case_type`, `stage`, `status`, `title`, `description`, `destination_country`, `institution`, `program`, `intake`, `amount`, `commission_amount`, `commission_paid`, `assigned_to`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'CS-2025-E0BACE', 3, 0, 'study_abroad', 'assessment', 'cancelled', 'Quibusdam ullam volu', 'Non dolores sit eiu', 'Germany', 'Ea qui molestiae sin', 'Deserunt nobis est d', 'January 2026', 81.00, 0.00, 'pending', NULL, '', '2025-12-26 00:05:02', '2026-05-07 14:37:38'),
(2, 'CS-2025-741A0D', 3, 0, 'study_abroad', 'assessment', 'cancelled', 'Quibusdam ullam volu', 'Non dolores sit eiu', 'Germany', 'Ea qui molestiae sin', 'Deserunt nobis est d', 'January 2026', 81.00, 0.00, 'pending', NULL, '', '2025-12-26 00:06:15', '2026-05-01 18:22:18'),
(3, 'CS-2025-50A05F', 3, 0, 'study_abroad', 'assessment', 'cancelled', 'Quibusdam ullam volu', 'Non dolores sit eiu', 'Germany', 'Ea qui molestiae sin', 'Deserunt nobis est d', 'January 2026', 81.00, 0.00, 'pending', NULL, '', '2025-12-26 00:07:01', '2026-04-29 19:38:55'),
(4, 'CS-2025-C5C623', 3, 0, 'visa_tourist', 'assessment', 'active', 'Deserunt sapiente al', 'Rem qui earum numqua', 'Dubai (UAE)', 'Id optio voluptatum', 'Irure aliquam ipsum ', 'September 2025', 3.00, 0.00, 'pending', NULL, '', '2025-12-26 00:10:20', '2025-12-26 00:10:20'),
(5, 'CS-2025-285CB4', 4, 1, 'visa_student', 'closed', 'on_hold', 'Nesciunt molestiae ', 'Eos at Nam voluptas', 'United Kingdom', 'Magni duis commodi a', 'Consequatur ut vel ', 'September 2026', 17.00, 1.70, 'pending', NULL, '', '2025-12-31 10:00:34', '2026-04-03 09:28:59'),
(6, 'CS-2025-A87274', 4, 1, 'study_abroad', 'completed', 'completed', 'At laborum in vel ut', 'Dolorem dolore nesci', 'Germany', 'Ut soluta aut ad eos', 'Similique aut simili', 'September 2025', 40000.00, 4000.00, 'pending', NULL, '', '2025-12-31 11:14:34', '2026-05-07 15:48:25'),
(7, 'CS-2026-A3D5DB', 5, NULL, 'travel_booking', 'assessment', 'completed', 'Case from Inquiry - Charles Benjamin', 'Quis et rem et ipsam', '', '', '', '', 0.00, 0.00, 'pending', NULL, '', '2026-01-01 23:06:50', '2026-05-07 11:05:05'),
(8, 'CS-2026-817A1B', 4, 1, 'visa_tourist', 'assessment', 'cancelled', 'Similique ut neque m', 'Quo necessitatibus n', 'Dubai (UAE)', 'Et placeat dolor qu', 'Voluptas illum dist', 'May', 35000.00, 3500.00, 'pending', NULL, '', '2026-01-15 17:01:28', '2026-04-03 00:52:39'),
(9, 'CS-2026-6D7AB6', 9, NULL, 'study_abroad', 'options', 'on_hold', 'Study', 'No', 'New Zealand', 'Any', 'Any', 'May', 100.00, 10.00, 'pending', NULL, '', '2026-01-21 17:59:18', '2026-03-04 12:04:52'),
(10, 'CS-2026-CBFCBE', 38, 7, 'other', 'assessment', 'active', 'other', '', 'Other', '', '', 'May', 100.00, 10.00, 'pending', NULL, '', '2026-01-23 14:10:52', '2026-01-23 14:10:52'),
(11, 'CS-2026-B856D5', 41, 7, 'other', 'assessment', 'cancelled', 'Study', '', 'Other', '', '', 'May', 100.00, 10.00, 'pending', NULL, '', '2026-01-23 14:39:23', '2026-04-25 10:13:55'),
(12, 'CS-2026-D2A2E4', 39, 7, 'other', 'assessment', 'on_hold', 'Study', '', 'Australia', '', '', 'September', 100.00, 10.00, 'pending', NULL, '', '2026-01-23 15:26:05', '2026-04-03 04:30:42'),
(13, 'CS-2026-7844B0', 44, 7, 'other', 'assessment', 'completed', 'Study', '', 'Other', '', '', 'September', 100.00, 10.00, 'pending', NULL, '', '2026-01-25 23:06:15', '2026-04-03 09:06:20'),
(14, 'CS-2026-E6A682', 43, 7, 'other', 'assessment', 'cancelled', 'Study', '', 'Other', '', '', 'September', 100.00, 10.00, 'pending', NULL, '', '2026-01-25 23:15:58', '2026-04-03 09:52:43'),
(15, 'CS-2026-5B2C1C', 40, 7, 'other', 'assessment', 'cancelled', 'Study', '', 'Australia', '', '', 'September', 100.00, 10.00, 'pending', NULL, '', '2026-01-25 23:34:13', '2026-05-03 23:17:16'),
(16, 'CS-2026-FD38F3', 45, 9, 'other', 'processing', 'completed', 'MRes September intake ', 'LOOKING FOR MOST AFFORTABLE OPTION AND LOW DEPOSIT FOR MRES PROGRAM IN UK OR SCOLAND. MY OTHER OPTIONS ARE CANADA, AUSTRAILA OR ITALY. CONSIDERING LOAN AND SCHOLARSHIP SUPPORT. ', 'United Kingdom', 'UEA', 'MASTERS IN RESEACH ', 'September', 100.00, 10.00, 'pending', NULL, '', '2026-02-11 09:10:07', '2026-05-07 02:11:17'),
(17, 'CS-2026-94A9E2', 6, NULL, 'study_abroad', 'assessment', 'completed', 'Case from Inquiry - Adebayo Oluwaseun Gabriel', 'Study abroad with dependant', '', '', '', '', 0.00, 0.00, 'pending', NULL, '', '2026-02-27 16:28:57', '2026-04-28 10:09:45');

-- --------------------------------------------------------

--
-- Table structure for table `case_stages_history`
--

CREATE TABLE `case_stages_history` (
  `id` int(11) NOT NULL,
  `case_id` int(11) NOT NULL,
  `from_stage` varchar(50) DEFAULT NULL,
  `to_stage` varchar(50) NOT NULL,
  `changed_by` int(11) NOT NULL,
  `changed_by_type` enum('admin','agent','client','system') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `case_stages_history`
--

INSERT INTO `case_stages_history` (`id`, `case_id`, `from_stage`, `to_stage`, `changed_by`, `changed_by_type`, `notes`, `created_at`) VALUES
(1, 1, NULL, 'assessment', 3, 'client', 'Initial stage', '2025-12-26 00:05:02'),
(2, 2, NULL, 'assessment', 3, 'client', 'Initial stage', '2025-12-26 00:06:15'),
(3, 3, NULL, 'assessment', 3, 'client', 'Initial stage', '2025-12-26 00:07:01'),
(4, 4, NULL, 'assessment', 3, 'client', 'Initial stage', '2025-12-26 00:10:20'),
(5, 5, NULL, 'assessment', 4, 'client', 'Initial stage', '2025-12-31 10:00:34'),
(6, 6, NULL, 'assessment', 4, 'client', 'Initial stage', '2025-12-31 11:14:34'),
(7, 6, 'assessment', 'offer', 1, 'admin', '', '2025-12-31 11:35:41'),
(8, 6, 'offer', 'completed', 1, 'admin', '', '2025-12-31 11:35:49'),
(9, 6, 'completed', 'travel', 1, 'admin', '', '2025-12-31 11:43:36'),
(10, 6, 'travel', 'completed', 1, 'admin', '', '2025-12-31 11:43:41'),
(11, 7, NULL, 'assessment', 1, 'admin', 'Initial stage', '2026-01-01 23:06:50'),
(12, 5, 'assessment', 'documents', 1, 'admin', '', '2026-01-02 09:36:16'),
(13, 5, 'documents', 'submission', 1, 'admin', '', '2026-01-02 09:36:41'),
(14, 5, 'submission', 'decision', 1, 'admin', '', '2026-01-02 09:36:55'),
(15, 5, 'decision', 'completed', 1, 'admin', '', '2026-01-02 09:37:04'),
(16, 5, 'completed', 'closed', 1, 'admin', '', '2026-01-02 09:37:28'),
(17, 8, NULL, 'assessment', 4, 'client', 'Initial stage', '2026-01-15 17:01:28'),
(18, 9, NULL, 'assessment', 9, 'client', 'Initial stage', '2026-01-21 17:59:19'),
(19, 10, NULL, 'assessment', 38, 'client', 'Initial stage', '2026-01-23 14:10:52'),
(20, 11, NULL, 'assessment', 41, 'client', 'Initial stage', '2026-01-23 14:39:23'),
(21, 12, NULL, 'assessment', 39, 'client', 'Initial stage', '2026-01-23 15:26:05'),
(22, 13, NULL, 'assessment', 44, 'client', 'Initial stage', '2026-01-25 23:06:15'),
(23, 14, NULL, 'assessment', 43, 'client', 'Initial stage', '2026-01-25 23:15:58'),
(24, 15, NULL, 'assessment', 40, 'client', 'Initial stage', '2026-01-25 23:34:13'),
(25, 16, NULL, 'assessment', 45, 'client', 'Initial stage', '2026-02-11 09:10:09'),
(26, 16, 'assessment', 'processing', 1, 'admin', 'apply on EDV, KC and AB', '2026-02-20 21:19:06'),
(27, 17, NULL, 'assessment', 1, 'admin', 'Initial stage', '2026-02-27 16:28:57'),
(28, 9, 'assessment', 'options', 1, 'admin', 'management and leadership available. show we go ahead', '2026-03-04 12:04:42');

-- --------------------------------------------------------

--
-- Table structure for table `case_types`
--

CREATE TABLE `case_types` (
  `id` int(11) NOT NULL,
  `type_key` varchar(50) NOT NULL COMMENT 'Unique identifier for the case type (e.g., study_abroad)',
  `name` varchar(100) NOT NULL COMMENT 'Display name for the case type',
  `description` text DEFAULT NULL COMMENT 'Description of what this case type offers',
  `icon` varchar(100) DEFAULT 'solar:document-text-outline' COMMENT 'Iconify icon class',
  `default_amount` decimal(12,2) DEFAULT 0.00 COMMENT 'Default price for this case type',
  `fixed_commission` decimal(12,2) DEFAULT 0.00 COMMENT 'Fixed commission amount',
  `commission_percent` decimal(5,2) DEFAULT 0.00 COMMENT 'Commission percentage (used if fixed_commission is 0)',
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'Whether this case type is active/available',
  `sort_order` int(11) DEFAULT 0 COMMENT 'Display order in listings',
  `stages` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'JSON array of stage configurations for this case type' CHECK (json_valid(`stages`)),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `case_types`
--

INSERT INTO `case_types` (`id`, `type_key`, `name`, `description`, `icon`, `default_amount`, `fixed_commission`, `commission_percent`, `is_active`, `sort_order`, `stages`, `created_at`, `updated_at`, `updated_by`) VALUES
(1, 'study_abroad', 'Study Abroad', 'Full study abroad application assistance', 'solar:square-academic-cap-outline', 100.00, 0.00, 10.00, 1, 1, '[{\"key\":\"assessment\",\"label\":\"Assessment\"},{\"key\":\"options\",\"label\":\"Options Provided\"},{\"key\":\"application\",\"label\":\"Application Submitted\"},{\"key\":\"submission\",\"label\":\"Submission Complete\"},{\"key\":\"offer\",\"label\":\"Offer Received\"},{\"key\":\"visa\",\"label\":\"Visa Processing\"},{\"key\":\"travel\",\"label\":\"Travel Arrangements\"},{\"key\":\"completed\",\"label\":\"Completed\"},{\"key\":\"closed\",\"label\":\"Closed\"}]', '2026-01-15 16:42:46', '2026-03-04 11:52:26', 1),
(2, 'visa_student', 'Student Visa', 'Student visa application processing', 'solar:passport-outline', 100.00, 0.00, 10.00, 1, 2, '[{\"key\":\"assessment\",\"label\":\"Assessment\"},{\"key\":\"documents\",\"label\":\"Document Collection\"},{\"key\":\"submission\",\"label\":\"Visa Submitted\"},{\"key\":\"decision\",\"label\":\"Decision Pending\"},{\"key\":\"completed\",\"label\":\"Visa Granted\"},{\"key\":\"closed\",\"label\":\"Closed\"}]', '2026-01-15 16:42:46', '2026-03-04 11:52:26', 1),
(3, 'visa_tourist', 'Tourist Visa', 'Tourist/visitor visa application', 'solar:airplane-outline', 100.00, 0.00, 10.00, 1, 3, '[{\"key\":\"assessment\",\"label\":\"Assessment\"},{\"key\":\"documents\",\"label\":\"Document Collection\"},{\"key\":\"submission\",\"label\":\"Visa Submitted\"},{\"key\":\"decision\",\"label\":\"Decision Pending\"},{\"key\":\"completed\",\"label\":\"Visa Granted\"},{\"key\":\"closed\",\"label\":\"Closed\"}]', '2026-01-15 16:42:46', '2026-03-04 11:52:26', 1),
(4, 'visa_family', 'Family Visa', 'Family reunion visa processing', 'solar:users-group-rounded-outline', 100.00, 0.00, 10.00, 1, 4, '[{\"key\":\"assessment\",\"label\":\"Assessment\"},{\"key\":\"documents\",\"label\":\"Document Collection\"},{\"key\":\"submission\",\"label\":\"Visa Submitted\"},{\"key\":\"decision\",\"label\":\"Decision Pending\"},{\"key\":\"completed\",\"label\":\"Visa Granted\"},{\"key\":\"closed\",\"label\":\"Closed\"}]', '2026-01-15 16:42:46', '2026-03-04 11:52:26', 1),
(5, 'travel_booking', 'Travel Booking', 'Flight and accommodation booking', 'solar:suitcase-outline', 100.00, 0.00, 10.00, 1, 5, '[{\"key\":\"requirements\",\"label\":\"Requirements\"},{\"key\":\"booking\",\"label\":\"Booking\"},{\"key\":\"completed\",\"label\":\"Completed\"},{\"key\":\"closed\",\"label\":\"Closed\"}]', '2026-01-15 16:42:46', '2026-03-04 11:52:26', 1),
(6, 'pilgrimage', 'Pilgrimage', 'Hajj/Umrah pilgrimage packages', 'solar:moon-outline', 100.00, 0.00, 10.00, 1, 6, '[{\"key\":\"requirements\",\"label\":\"Requirements\"},{\"key\":\"booking\",\"label\":\"Booking\"},{\"key\":\"completed\",\"label\":\"Completed\"},{\"key\":\"closed\",\"label\":\"Closed\"}]', '2026-01-15 16:42:46', '2026-03-04 11:52:26', 1),
(7, 'student_loan', 'Student Loan', 'Student loan application assistance', 'solar:money-bag-outline', 100.00, 0.00, 10.00, 1, 7, '[{\"key\":\"assessment\",\"label\":\"Assessment\"},{\"key\":\"documents\",\"label\":\"Document Collection\"},{\"key\":\"review\",\"label\":\"Under Review\"},{\"key\":\"approval\",\"label\":\"Approval Pending\"},{\"key\":\"disbursement\",\"label\":\"Disbursement\"},{\"key\":\"repayment\",\"label\":\"Repayment\"},{\"key\":\"completed\",\"label\":\"Completed\"},{\"key\":\"closed\",\"label\":\"Closed\"}]', '2026-01-15 16:42:46', '2026-03-04 11:52:26', 1),
(8, 'other', 'Other Services', 'Other travel and visa services', 'solar:document-text-outline', 100.00, 0.00, 10.00, 1, 8, '[\r\n    {\"key\": \"assessment\", \"label\": \"Assessment\"},\r\n    {\"key\": \"processing\", \"label\": \"Processing\"},\r\n    {\"key\": \"completed\", \"label\": \"Completed\"},\r\n    {\"key\": \"closed\", \"label\": \"Closed\"}\r\n]', '2026-01-15 16:42:46', '2026-03-04 11:52:26', 1),
(11, 'scholarships', 'Scholarship', 'study abroad on scholarship,\r\n Monthly stipends, \r\nfully funded,\r\naccommodation\r\nand More', 'solar:money-bag-outline', 100.00, 200000.00, 10.00, 1, 7, '[{\"key\":\"assessment\",\"label\":\"Assessment\"},{\"key\":\"processing\",\"label\":\"Processing\"},{\"key\":\"completed\",\"label\":\"Completed\"},{\"key\":\"closed\",\"label\":\"Closed\"}]', '2026-01-18 15:13:20', '2026-03-04 11:52:26', 1),
(12, 'japa_abroad', 'Australia & New Zealand Cert III', 'certificate III programs\r\nhospitality\r\nbusiness\r\nsocial workers', 'solar:cardiology-outline', 10000.00, 0.00, 10.00, 1, 9, '[{\"key\":\"assessment\",\"label\":\"Assessment\"},{\"key\":\"processing\",\"label\":\"Processing\"},{\"key\":\"completed\",\"label\":\"Completed\"},{\"key\":\"closed\",\"label\":\"Closed\"}]', '2026-01-22 12:04:23', '2026-01-22 12:04:23', 1),
(13, 'research_proposal', 'Research Proposals', 'Mres\r\nMaster by research', 'solar:document-text-outline', 25000.00, 0.00, 10.00, 1, 11, '[{\"key\":\"assessment\",\"label\":\"Assessment\"},{\"key\":\"processing\",\"label\":\"Processing\"},{\"key\":\"completed\",\"label\":\"Completed\"},{\"key\":\"closed\",\"label\":\"Closed\"}]', '2026-01-22 19:36:18', '2026-01-22 19:36:18', 1),
(14, 'vhs_service', 'VHS service fees($288)', 'document review\r\ndocumenyt check\r\nfish out red flags', 'solar:moon-outline', 400000.00, 0.00, 10.00, 1, 12, '[{\"key\":\"assessment\",\"label\":\"Assessment\"},{\"key\":\"processing\",\"label\":\"Processing\"},{\"key\":\"completed\",\"label\":\"Completed\"},{\"key\":\"closed\",\"label\":\"Closed\"}]', '2026-01-22 19:39:38', '2026-01-22 19:39:38', 1),
(15, 'study_uk', 'Study In The United Kingdom', 'PGD\r\nBSC\r\nMSC\r\nMRes\r\nPhD', 'solar:square-academic-cap-outline', 100.00, 0.00, 10.00, 1, 1, '[{\"key\":\"assessment\",\"label\":\"Assessment\"},{\"key\":\"processing\",\"label\":\"Processing\"},{\"key\":\"completed\",\"label\":\"Completed\"},{\"key\":\"Offer\",\"label\":\"Offer\"},{\"key\":\"Ready For Visa\",\"label\":\"Ready For Visa\"}]', '2026-02-27 16:21:26', '2026-03-04 11:52:26', 1);

-- --------------------------------------------------------

--
-- Table structure for table `commissions`
--

CREATE TABLE `commissions` (
  `id` int(11) NOT NULL,
  `agent_id` int(11) NOT NULL,
  `case_id` int(11) DEFAULT NULL,
  `client_id` int(11) NOT NULL,
  `commission_type` enum('referral','case_completion','service','bonus') NOT NULL DEFAULT 'case_completion',
  `amount` decimal(12,2) NOT NULL,
  `rate_percentage` decimal(5,2) DEFAULT NULL,
  `case_amount` decimal(12,2) DEFAULT 0.00,
  `status` enum('pending','approved','paid','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `payment_method` varchar(100) DEFAULT NULL,
  `payment_reference` varchar(255) DEFAULT NULL,
  `paid_date` datetime DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `commissions`
--

INSERT INTO `commissions` (`id`, `agent_id`, `case_id`, `client_id`, `commission_type`, `amount`, `rate_percentage`, `case_amount`, `status`, `payment_method`, `payment_reference`, `paid_date`, `approved_by`, `approved_at`, `notes`, `created_at`) VALUES
(1, 1, 6, 4, 'case_completion', 4000.00, 10.00, 40000.00, 'paid', NULL, NULL, '2025-12-31 11:47:17', 1, '2025-12-31 11:47:17', NULL, '2025-12-31 11:43:41'),
(2, 1, 5, 4, 'case_completion', 1.70, 10.00, 17.00, 'rejected', NULL, NULL, NULL, 1, '2026-02-12 09:35:18', NULL, '2026-01-02 09:37:04');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `case_id` int(11) DEFAULT NULL,
  `client_id` int(11) NOT NULL,
  `document_type` enum('passport','transcript','certificate','statement_of_purpose','cv','recommendation','financial_proof','visa','offer_letter','identity_proof','income_proof','admission_letter','fee_schedule','bank_statement','guarantor_form','collateral_document','other') NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `uploaded_by` enum('client','agent','admin','system') NOT NULL DEFAULT 'client',
  `status` enum('pending','verified','rejected','expired') NOT NULL DEFAULT 'pending',
  `expiry_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `case_id`, `client_id`, `document_type`, `file_path`, `file_name`, `file_size`, `uploaded_by`, `status`, `expiry_date`, `notes`, `created_at`) VALUES
(1, 4, 3, 'recommendation', '../uploads/documents/1766704220_testFile.png', '1766704220_testFile.png', 150, 'client', 'pending', NULL, NULL, '2025-12-26 00:10:20'),
(2, 5, 4, 'certificate', '../uploads/documents/1767171634_University Assembly Flyer.jpeg', '1767171634_University Assembly Flyer.jpeg', 84910, 'client', 'verified', NULL, '', '2025-12-31 10:00:34'),
(3, 15, 40, 'passport', '../uploads/documents/1769900894_passport data page.pdf', '1769900894_passport data page.pdf', 95424, 'admin', 'verified', NULL, '', '2026-02-01 00:08:14'),
(4, 16, 45, 'passport', '../uploads/documents/1771618579_Joy Bisong International Passport.pdf', '1771618579_Joy Bisong International Passport.pdf', 58584, 'admin', 'verified', NULL, '', '2026-02-20 21:16:19'),
(5, 16, 45, 'cv', '../uploads/documents/1771618633_Bisong Joy  Mres CV.pdf', '1771618633_Bisong Joy  Mres CV.pdf', 14213, 'admin', 'verified', NULL, '', '2026-02-20 21:17:13');

-- --------------------------------------------------------

--
-- Table structure for table `inquiries`
--

CREATE TABLE `inquiries` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `agent_id` int(11) DEFAULT NULL,
  `status` enum('new','contacted','resolved') NOT NULL DEFAULT 'new',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `service_type` enum('study_abroad','visa_student','visa_tourist','visa_family','travel_booking','pilgrimage','other') DEFAULT NULL,
  `source` enum('website','whatsapp','referral','social_media','other') NOT NULL DEFAULT 'website',
  `converted_to_case` tinyint(1) NOT NULL DEFAULT 0,
  `case_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inquiries`
--

INSERT INTO `inquiries` (`id`, `name`, `email`, `phone`, `message`, `agent_id`, `status`, `created_at`, `service_type`, `source`, `converted_to_case`, `case_id`) VALUES
(1, 'Charles Benjamin', 'bebefuw@example.com', '+1 (775) 793-7684', 'Quis et rem et ipsam', NULL, 'new', '2025-12-31 19:32:34', 'travel_booking', 'website', 1, 7),
(2, 'Adebayo Oluwaseun Gabriel', 'ardeybaryor2000@gmail.com', '08038086379', 'Study abroad with dependant', NULL, 'contacted', '2026-01-19 16:19:30', 'study_abroad', 'website', 1, 17),
(3, 'Thorsten Aguayo', 'indexing@searches-applyboardafrica.com', '46579366', 'Hello,\\r\\n\\r\\nadd applyboardafrica.com to Google Search Index to be displayed in websearch results!\\r\\n\\r\\nSubmit applyboardafrica.com now at https://searchregister.net', NULL, 'new', '2026-01-19 19:19:33', 'study_abroad', 'website', 0, NULL),
(4, 'Ab Y', 'info@bestaiseocompany.com', '(949)Â 508-0277', 'Hey team applyboardafrica.com,\\r\\n\\r\\nHope your doing well!\\r\\n\\r\\nI just following your website and realized that despite having a good design; but it was not ranking high on any of the Search Engines (Google, Yahoo &amp; Bing) for most of the keywords related to your business.\\r\\n\\r\\nWe can place your website on Google&#039;s 1st page.\\r\\n\\r\\n*  Top ranking on Google search!\\r\\n*  Improve website clicks and views!\\r\\n*  Increase Your Leads, clients &amp; Revenue!\\r\\n\\r\\nInterested? Please provide your name, contact information, and email.\\r\\n\\r\\nBests Regards,\\r\\nAby\\r\\nBest AI SEO Company\\r\\nAccounts Manager\\r\\nwww.bestaiseocompany.com\\r\\nPhone No: +1Â (949)Â 508-0277', NULL, 'resolved', '2026-02-03 00:01:14', 'other', 'website', 0, NULL),
(5, 'Aramude Abraham', 'aramudeabraham@gmail.com', '09073002786', 'Study abroad', NULL, 'contacted', '2026-02-12 15:18:34', 'study_abroad', 'website', 0, NULL),
(6, 'Iyanda Zainab titilayo', 'rehanix09@gmail.com', '07032459663', 'Hello\\r\\nPlease  I have bsc accounting.  3.39 cgp. Which second class lower. I need  canada program  that ll loan / funding  assistance. And i wish get a program that ll allow my dependants  join .\\r\\n\\r\\n Thank you.', NULL, 'resolved', '2026-03-23 18:40:18', 'visa_student', 'website', 0, NULL),
(7, 'Nancy', 'nancy.99seosolutionworld@gmail.com', '8468088599', 'Hi,\\r\\n\\r\\nDo you want rank your website on the 1st page of Google?\\r\\n\\r\\nWe can help you in putting your website on Google top page and getting more customers.\\r\\n\\r\\nâ€¢Would you like to optimize your site? I will be happy to share\\r\\nwith you our pricing and proposals.\\r\\n\\r\\nMay I send you SEO Packages/Cost?\\r\\n\\r\\nThank you,\\r\\nNancy', NULL, 'resolved', '2026-04-10 00:44:32', NULL, 'website', 0, NULL),
(8, 'Precious Banjoko', 'tayoolobayo@gmail.com', '07055641705', 'Interested in study abroad(Canada) kindly assist. Thanks', NULL, 'resolved', '2026-04-13 22:36:37', 'study_abroad', 'website', 0, NULL),
(9, 'Ab Y', 'info@bestaiseocompany.com', '(949)Â 508-0277', 'Hey team applyboardafrica.com,\\r\\n\\r\\nI would like to discuss SEO!\\r\\n\\r\\nI can help your website to get on first page of Google and increase the number of leads and sales you are getting from your website.\\r\\n\\r\\nMay I send you a quote &amp; price list?\\r\\n\\r\\nBests Regards,\\r\\nAby\\r\\nBest AI SEO Company\\r\\nAccounts Manager\\r\\nwww.letsgetoptimize.com\\r\\nPhone No: +1Â (949)Â 508-0277', NULL, 'new', '2026-05-07 03:27:15', 'travel_booking', 'website', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `loan_documents`
--

CREATE TABLE `loan_documents` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `document_type` enum('identity_proof','income_proof','admission_letter','fee_schedule','bank_statement','guarantor_form','collateral_document','other') NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `verification_notes` text DEFAULT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loan_documents`
--

INSERT INTO `loan_documents` (`id`, `loan_id`, `document_type`, `file_path`, `file_name`, `file_size`, `status`, `verification_notes`, `uploaded_at`) VALUES
(1, 1, 'admission_letter', '../uploads/loan_documents/1767952119_2149156402.jpg', '1767952119_2149156402.jpg', 590674, 'pending', NULL, '2026-01-09 10:48:39'),
(2, 3, 'income_proof', '../uploads/loan_documents/1767962359_2149156402.jpg', '1767962359_2149156402.jpg', 590674, 'pending', NULL, '2026-01-09 13:39:19');

-- --------------------------------------------------------

--
-- Table structure for table `loan_repayments`
--

CREATE TABLE `loan_repayments` (
  `id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `payment_reference` varchar(100) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(50) DEFAULT 'paystack',
  `payment_date` datetime NOT NULL,
  `status` enum('pending','success','failed','reversed') NOT NULL DEFAULT 'success',
  `transaction_id` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(11) NOT NULL,
  `migration_name` varchar(255) NOT NULL,
  `executed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration_name`, `executed_at`) VALUES
(1, 'case_types_migration_2025_01_15', '2026-01-15 16:42:46'),
(2, 'staff_password_reset_2025_01_15', '2026-01-15 20:27:30');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_type` enum('admin','agent','client') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') NOT NULL DEFAULT 'info',
  `link` varchar(500) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `user_type`, `title`, `message`, `type`, `link`, `is_read`, `created_at`) VALUES
(1, 1, 'agent', 'Agent Alert', 'Please check your dashboard for important updates.', 'info', '', 1, '2025-12-30 16:16:22'),
(2, 1, 'agent', 'Case Stage Updated', 'Case CS-2025-A87274 has been moved to Offer Received', 'success', '/agent/cases.php?view=6', 1, '2025-12-31 11:35:41'),
(3, 4, 'client', 'Your Case Status Updated', 'Your case CS-2025-A87274 has been updated to: Offer Received', 'success', '/user/cases.php?view=6', 0, '2025-12-31 11:35:41'),
(4, 1, 'agent', 'Case Stage Updated', 'Case CS-2025-A87274 has been moved to Completed', 'success', '/agent/cases.php?view=6', 1, '2025-12-31 11:35:49'),
(5, 4, 'client', 'Your Case Status Updated', 'Your case CS-2025-A87274 has been updated to: Completed', 'success', '/user/cases.php?view=6', 0, '2025-12-31 11:35:49'),
(6, 1, 'agent', 'Case Stage Updated', 'Case CS-2025-A87274 has been moved to Travel Arrangements', 'success', '/agent/cases.php?view=6', 1, '2025-12-31 11:43:36'),
(7, 4, 'client', 'Your Case Status Updated', 'Your case CS-2025-A87274 has been updated to: Travel Arrangements', 'success', '/user/cases.php?view=6', 0, '2025-12-31 11:43:36'),
(8, 1, 'agent', 'Case Stage Updated', 'Case CS-2025-A87274 has been moved to Completed', 'success', '/agent/cases.php?view=6', 1, '2025-12-31 11:43:41'),
(9, 4, 'client', 'Your Case Status Updated', 'Your case CS-2025-A87274 has been updated to: Completed', 'success', '/user/cases.php?view=6', 0, '2025-12-31 11:43:41'),
(10, 1, 'agent', 'Commission Earned', 'You earned a commission of ₦4,000.00 for case #CS-2025-A87274', 'success', 'commissions.php', 1, '2025-12-31 11:43:41'),
(11, 1, 'agent', 'Case Stage Updated', 'Case CS-2025-285CB4 has been moved to documents', 'success', '/agent/cases.php?view=5', 1, '2026-01-02 09:36:16'),
(12, 4, 'client', 'Your Case Status Updated', 'Your case CS-2025-285CB4 has been updated to: documents', 'success', '/user/cases.php?view=5', 0, '2026-01-02 09:36:16'),
(13, 1, 'agent', 'Case Stage Updated', 'Case CS-2025-285CB4 has been moved to Submission Complete', 'success', '/agent/cases.php?view=5', 1, '2026-01-02 09:36:41'),
(14, 4, 'client', 'Your Case Status Updated', 'Your case CS-2025-285CB4 has been updated to: Submission Complete', 'success', '/user/cases.php?view=5', 0, '2026-01-02 09:36:41'),
(15, 1, 'agent', 'Case Stage Updated', 'Case CS-2025-285CB4 has been moved to Decision Pending', 'success', '/agent/cases.php?view=5', 1, '2026-01-02 09:36:55'),
(16, 4, 'client', 'Your Case Status Updated', 'Your case CS-2025-285CB4 has been updated to: Decision Pending', 'success', '/user/cases.php?view=5', 0, '2026-01-02 09:36:55'),
(17, 1, 'agent', 'Case Stage Updated', 'Case CS-2025-285CB4 has been moved to Completed', 'success', '/agent/cases.php?view=5', 1, '2026-01-02 09:37:04'),
(18, 4, 'client', 'Your Case Status Updated', 'Your case CS-2025-285CB4 has been updated to: Completed', 'success', '/user/cases.php?view=5', 0, '2026-01-02 09:37:04'),
(19, 1, 'agent', 'Commission Earned', 'You earned a commission of ₦1.70 for case #CS-2025-285CB4', 'success', 'commissions.php', 1, '2026-01-02 09:37:04'),
(20, 1, 'agent', 'Case Stage Updated', 'Case CS-2025-285CB4 has been moved to Closed', 'success', '/agent/cases.php?view=5', 1, '2026-01-02 09:37:28'),
(21, 4, 'client', 'Your Case Status Updated', 'Your case CS-2025-285CB4 has been updated to: Closed', 'success', '/user/cases.php?view=5', 0, '2026-01-02 09:37:28'),
(22, 4, 'client', 'Payment Successful', 'Your payment of ₦35,000.00 was successful. Your application has been submitted.', 'success', 'cases.php?id=8', 0, '2026-01-15 17:01:28'),
(23, 1, 'agent', 'New Case Assigned', 'A new Tourist Visa case has been assigned to you.', 'info', 'cases.php?id=8', 0, '2026-01-15 17:01:28'),
(24, 9, 'client', 'Payment Successful', 'Your payment of â‚¦100.00 was successful. Your application has been submitted.', 'success', 'cases.php?id=9', 1, '2026-01-21 17:59:19'),
(25, 7, 'agent', 'New Client Registered', 'A new client (Oluwatobi Oguntade) has registered using your referral link.', 'success', NULL, 1, '2026-01-21 19:06:21'),
(26, 7, 'agent', 'New Client Registered', 'A new client (MADUEKE SABINA NJIDEKA) has registered using your referral link.', 'success', NULL, 1, '2026-01-23 11:45:56'),
(27, 7, 'agent', 'New Client Registered', 'A new client (Mmachi Greatness Peters) has registered using your referral link.', 'success', NULL, 1, '2026-01-23 12:08:21'),
(28, 7, 'agent', 'New Client Registered', 'A new client (OKEBOWALE BOLAJI AKOREDE) has registered using your referral link.', 'success', NULL, 1, '2026-01-23 12:16:41'),
(29, 7, 'agent', 'New Client Registered', 'A new client (Marvellous Titilope Abu) has registered using your referral link.', 'success', NULL, 1, '2026-01-23 12:32:36'),
(30, 7, 'agent', 'New Client Registered', 'A new client (OLUWASEUN MOJIRAYO AJAYI) has registered using your referral link.', 'success', NULL, 1, '2026-01-23 12:56:13'),
(31, 7, 'agent', 'New Client Registered', 'A new client (OSUYA SPENCER SEUN) has registered using your referral link.', 'success', NULL, 1, '2026-01-23 13:14:42'),
(32, 9, 'agent', 'New Client Registered', 'A new client (Joy Odije Bisong) has registered using your referral link.', 'success', NULL, 0, '2026-01-23 14:04:06'),
(33, 38, 'client', 'Payment Successful', 'Your payment of â‚¦100.00 was successful. Your application has been submitted.', 'success', 'cases.php?id=10', 0, '2026-01-23 14:10:52'),
(34, 7, 'agent', 'New Case Assigned', 'A new Other Services case has been assigned to you.', 'info', 'cases.php?id=10', 0, '2026-01-23 14:10:52'),
(35, 41, 'client', 'Payment Successful', 'Your payment of â‚¦100.00 was successful. Your application has been submitted.', 'success', 'cases.php?id=11', 0, '2026-01-23 14:39:23'),
(36, 7, 'agent', 'New Case Assigned', 'A new Other Services case has been assigned to you.', 'info', 'cases.php?id=11', 0, '2026-01-23 14:39:23'),
(37, 39, 'client', 'Payment Successful', 'Your payment of â‚¦100.00 was successful. Your application has been submitted.', 'success', 'cases.php?id=12', 0, '2026-01-23 15:26:05'),
(38, 7, 'agent', 'New Case Assigned', 'A new Other Services case has been assigned to you.', 'info', 'cases.php?id=12', 0, '2026-01-23 15:26:05'),
(39, 44, 'client', 'Payment Successful', 'Your payment of â‚¦100.00 was successful. Your application has been submitted.', 'success', 'cases.php?id=13', 0, '2026-01-25 23:06:15'),
(40, 7, 'agent', 'New Case Assigned', 'A new Other Services case has been assigned to you.', 'info', 'cases.php?id=13', 0, '2026-01-25 23:06:15'),
(41, 43, 'client', 'Payment Successful', 'Your payment of â‚¦100.00 was successful. Your application has been submitted.', 'success', 'cases.php?id=14', 0, '2026-01-25 23:15:58'),
(42, 7, 'agent', 'New Case Assigned', 'A new Other Services case has been assigned to you.', 'info', 'cases.php?id=14', 0, '2026-01-25 23:15:58'),
(43, 40, 'client', 'Payment Successful', 'Your payment of â‚¦100.00 was successful. Your application has been submitted.', 'success', 'cases.php?id=15', 0, '2026-01-25 23:34:13'),
(44, 7, 'agent', 'New Case Assigned', 'A new Other Services case has been assigned to you.', 'info', 'cases.php?id=15', 0, '2026-01-25 23:34:13'),
(45, 45, 'client', 'Payment Successful', 'Your payment of â‚¦100.00 was successful. Your application has been submitted.', 'success', 'cases.php?id=16', 0, '2026-02-11 09:10:09'),
(46, 9, 'agent', 'New Case Assigned', 'A new Other Services case has been assigned to you.', 'info', 'cases.php?id=16', 0, '2026-02-11 09:10:09'),
(47, 9, 'agent', 'New Client Registered', 'A new client (Mustapha Opeyemi) has registered using your referral link.', 'success', NULL, 0, '2026-02-11 11:45:45'),
(48, 9, 'agent', 'Case Stage Updated', 'Case CS-2026-FD38F3 has been moved to Processing', 'success', '/agent/cases.php?view=16', 0, '2026-02-20 21:19:06'),
(49, 45, 'client', 'Your Case Status Updated', 'Your case CS-2026-FD38F3 has been updated to: Processing', 'success', '/user/cases.php?view=16', 0, '2026-02-20 21:19:06'),
(50, 12, 'agent', 'New Client Registered', 'A new client (OLUWABUSUYI SEYI DANIEL) has registered using your referral link.', 'success', NULL, 1, '2026-02-27 16:13:54'),
(51, 12, 'agent', 'New Client Registered', 'A new client (FLORENCE FOLASHADE ADENIRAN) has registered using your referral link.', 'success', NULL, 1, '2026-02-27 16:27:28'),
(52, 12, 'agent', 'New Client Registered', 'A new client (Akachukwu Godspeace Chijindu) has registered using your referral link.', 'success', NULL, 1, '2026-03-02 10:29:38'),
(53, 9, 'client', 'Your Case Status Updated', 'Your case CS-2026-6D7AB6 has been updated to: Options Provided', 'success', '/user/cases.php?view=9', 1, '2026-03-04 12:04:43');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `case_id` int(11) DEFAULT NULL,
  `reference` varchar(100) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(10) DEFAULT 'NGN',
  `status` enum('pending','success','failed','refunded') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT 'paystack',
  `case_type` varchar(50) DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `user_id`, `case_id`, `reference`, `amount`, `currency`, `status`, `payment_method`, `case_type`, `metadata`, `paid_at`, `created_at`) VALUES
(1, 4, NULL, 'APP_1767174458_4_E4D732', 40000.00, 'NGN', 'pending', 'paystack', 'study_abroad', '{\"case_type\":\"study_abroad\",\"title\":\"In asperiores laboru\",\"description\":\"Accusamus sit magni \",\"destination_country\":\"Canada\",\"institution\":\"Ad quis reprehenderi\",\"program\":\"Enim fugit dolor se\",\"intake\":\"January 2026\",\"amount\":40000,\"commission\":4000}', NULL, '2025-12-31 10:47:38'),
(2, 4, NULL, 'APP_1767175035_4_A21951', 40000.00, 'NGN', 'pending', 'paystack', 'study_abroad', '{\"case_type\":\"study_abroad\",\"title\":\"Voluptatibus error d\",\"description\":\"Et veritatis a dolor\",\"destination_country\":\"Saudi Arabia\",\"institution\":\"Qui ut ipsum doloru\",\"program\":\"Sed consequatur Est\",\"intake\":\"January 2025\",\"amount\":40000,\"commission\":4000}', NULL, '2025-12-31 10:57:15'),
(3, 4, NULL, 'APP_1767175123_4_B2E1E9', 40000.00, 'NGN', 'pending', 'paystack', 'study_abroad', '{\"case_type\":\"study_abroad\",\"title\":\"Voluptatibus error d\",\"description\":\"Et veritatis a dolor\",\"destination_country\":\"Saudi Arabia\",\"institution\":\"Qui ut ipsum doloru\",\"program\":\"Sed consequatur Est\",\"intake\":\"January 2025\",\"amount\":40000,\"commission\":4000}', NULL, '2025-12-31 10:58:43'),
(4, 4, 6, 'APP_1767175845_4_963646', 40000.00, 'NGN', 'success', 'paystack', 'study_abroad', '{\"case_type\":\"study_abroad\",\"title\":\"At laborum in vel ut\",\"description\":\"Dolorem dolore nesci\",\"destination_country\":\"Germany\",\"institution\":\"Ut soluta aut ad eos\",\"program\":\"Similique aut simili\",\"intake\":\"September 2025\",\"amount\":40000,\"commission\":4000}', '2025-12-31 11:14:34', '2025-12-31 11:10:45'),
(5, 4, 8, 'APP_1768492761_4_ED6A1C', 35000.00, 'NGN', 'success', 'paystack', 'visa_tourist', '{\"case_type\":\"visa_tourist\",\"title\":\"Similique ut neque m\",\"description\":\"Quo necessitatibus n\",\"destination_country\":\"Dubai (UAE)\",\"institution\":\"Et placeat dolor qu\",\"program\":\"Voluptas illum dist\",\"intake\":\"May\",\"amount\":35000,\"commission\":3500}', '2026-01-15 17:01:28', '2026-01-15 16:59:21'),
(6, 6, NULL, 'APP_1768558292_6_D92611', 40000.00, 'NGN', 'pending', 'paystack', 'study_abroad', '{\"case_type\":\"study_abroad\",\"title\":\"2026 study in Australia \",\"description\":\"\",\"destination_country\":\"Australia\",\"institution\":\"\",\"program\":\"Certificate course\",\"intake\":\"May\",\"amount\":40000,\"commission\":4000}', NULL, '2026-01-16 11:11:32'),
(7, 9, NULL, 'APP_1768747279_9_C7D7D8', 500.00, 'NGN', 'pending', 'paystack', 'other', '{\"case_type\":\"other\",\"title\":\"other\",\"description\":\"d\",\"destination_country\":\"Other\",\"institution\":\"d\",\"program\":\"d\",\"intake\":\"May\",\"amount\":500,\"commission\":50}', NULL, '2026-01-18 15:41:19'),
(8, 6, NULL, 'APP_1768836193_6_F3F01F', 10000.00, 'NGN', 'pending', 'paystack', 'study_abroad', '{\"case_type\":\"study_abroad\",\"title\":\"Study in Australia \",\"description\":\"\",\"destination_country\":\"Australia\",\"institution\":\"Australian institute of business and technical education \",\"program\":\"Certificate course\",\"intake\":\"May\",\"amount\":10000,\"commission\":1000}', NULL, '2026-01-19 16:23:13'),
(9, 6, NULL, 'APP_1768837428_6_4D6F7A', 500.00, 'NGN', 'pending', 'paystack', 'other', '{\"case_type\":\"other\",\"title\":\"Study in Australia \",\"description\":\"\",\"destination_country\":\"Australia\",\"institution\":\"Australian institute of business and technical education \",\"program\":\"Certificate course\",\"intake\":\"May\",\"amount\":500,\"commission\":50}', NULL, '2026-01-19 16:43:48'),
(10, 6, NULL, 'APP_1768838352_6_BA984B', 500.00, 'NGN', 'pending', 'paystack', 'other', '{\"case_type\":\"other\",\"title\":\"Study in Australia \",\"description\":\"\",\"destination_country\":\"Australia\",\"institution\":\"Australian institute of business and technical education \",\"program\":\"Certificate course\",\"intake\":\"May\",\"amount\":500,\"commission\":50}', NULL, '2026-01-19 16:59:12'),
(11, 9, 9, 'APP_1769014710_9_D3313A', 100.00, 'NGN', 'success', 'paystack', 'study_abroad', '{\"case_type\":\"study_abroad\",\"title\":\"Study\",\"description\":\"No\",\"destination_country\":\"New Zealand\",\"institution\":\"Any\",\"program\":\"Any\",\"intake\":\"May\",\"amount\":100,\"commission\":10}', '2026-01-21 17:59:19', '2026-01-21 17:58:30'),
(12, 38, 10, 'APP_1769173630_38_53E958', 100.00, 'NGN', 'success', 'paystack', 'other', '{\"case_type\":\"other\",\"title\":\"other\",\"description\":\"\",\"destination_country\":\"Other\",\"institution\":\"\",\"program\":\"\",\"intake\":\"May\",\"amount\":100,\"commission\":10}', '2026-01-23 14:10:52', '2026-01-23 14:07:10'),
(13, 41, 11, 'APP_1769174365_41_85CBB3', 100.00, 'NGN', 'success', 'paystack', 'other', '{\"case_type\":\"other\",\"title\":\"Study\",\"description\":\"\",\"destination_country\":\"Other\",\"institution\":\"\",\"program\":\"\",\"intake\":\"May\",\"amount\":100,\"commission\":10}', '2026-01-23 14:39:23', '2026-01-23 14:19:25'),
(14, 39, 12, 'APP_1769177905_39_AFA08C', 100.00, 'NGN', 'success', 'paystack', 'other', '{\"case_type\":\"other\",\"title\":\"Study\",\"description\":\"\",\"destination_country\":\"Australia\",\"institution\":\"\",\"program\":\"\",\"intake\":\"September\",\"amount\":100,\"commission\":10}', '2026-01-23 15:26:05', '2026-01-23 15:18:25'),
(15, 44, 13, 'APP_1769378687_44_733BA4', 100.00, 'NGN', 'success', 'paystack', 'other', '{\"case_type\":\"other\",\"title\":\"Study\",\"description\":\"\",\"destination_country\":\"Other\",\"institution\":\"\",\"program\":\"\",\"intake\":\"September\",\"amount\":100,\"commission\":10}', '2026-01-25 23:06:15', '2026-01-25 23:04:47'),
(16, 43, 14, 'APP_1769379199_43_943CAF', 100.00, 'NGN', 'success', 'paystack', 'other', '{\"case_type\":\"other\",\"title\":\"Study\",\"description\":\"\",\"destination_country\":\"Other\",\"institution\":\"\",\"program\":\"\",\"intake\":\"September\",\"amount\":100,\"commission\":10}', '2026-01-25 23:15:58', '2026-01-25 23:13:19'),
(17, 40, 15, 'APP_1769380395_40_B57877', 100.00, 'NGN', 'success', 'paystack', 'other', '{\"case_type\":\"other\",\"title\":\"Study\",\"description\":\"\",\"destination_country\":\"Australia\",\"institution\":\"\",\"program\":\"\",\"intake\":\"September\",\"amount\":100,\"commission\":10}', '2026-01-25 23:34:13', '2026-01-25 23:33:15'),
(18, 45, 16, 'APP_1770797162_45_76C75B', 100.00, 'NGN', 'success', 'paystack', 'other', '{\"case_type\":\"other\",\"title\":\"MRes September intake \",\"description\":\"LOOKING FOR MOST AFFORTABLE OPTION AND LOW DEPOSIT FOR MRES PROGRAM IN UK OR SCOLAND. MY OTHER OPTIONS ARE CANADA, AUSTRAILA OR ITALY. CONSIDERING LOAN AND SCHOLARSHIP SUPPORT. \",\"destination_country\":\"United Kingdom\",\"institution\":\"UEA\",\"program\":\"MASTERS IN RESEACH \",\"intake\":\"September\",\"amount\":100,\"commission\":10}', '2026-02-11 09:10:09', '2026-02-11 09:06:02'),
(19, 69, NULL, 'APP_1771247907_69_AC8B3E', 10000.00, 'NGN', 'pending', 'paystack', 'study_abroad', '{\"case_type\":\"study_abroad\",\"title\":\"Health science \",\"description\":\"I\'m interested to go united state also to study and work and the helping for family \",\"destination_country\":\"United Kingdom\",\"institution\":\"Sport university of Nigeria \",\"program\":\"Nursing science \",\"intake\":\"September\",\"amount\":10000,\"commission\":1000}', NULL, '2026-02-16 14:18:27'),
(20, 74, NULL, 'APP_1771331951_74_E64F93', 10000.00, 'NGN', 'pending', 'paystack', 'student_loan', '{\"case_type\":\"student_loan\",\"title\":\"Muhammad \",\"description\":\"\",\"destination_country\":\"Other\",\"institution\":\"Canada\",\"program\":\"Bnsc nursin\",\"intake\":\"September\",\"amount\":10000,\"commission\":1000}', NULL, '2026-02-17 13:39:11'),
(21, 75, NULL, 'APP_1771338137_75_8B0532', 10000.00, 'NGN', 'pending', 'paystack', 'study_abroad', '{\"case_type\":\"study_abroad\",\"title\":\"2026 study in usa\",\"description\":\"My application required is to help the bird access my profile and know that truely am interested\",\"destination_country\":\"United States\",\"institution\":\"University of United States \",\"program\":\"Christian religious studies\",\"intake\":\"September\",\"amount\":10000,\"commission\":1000}', NULL, '2026-02-17 15:22:17'),
(22, 75, NULL, 'APP_1771338139_75_49E12D', 10000.00, 'NGN', 'pending', 'paystack', 'study_abroad', '{\"case_type\":\"study_abroad\",\"title\":\"2026 study in usa\",\"description\":\"My application required is to help the bird access my profile and know that truely am interested\",\"destination_country\":\"United States\",\"institution\":\"University of United States \",\"program\":\"Christian religious studies\",\"intake\":\"September\",\"amount\":10000,\"commission\":1000}', NULL, '2026-02-17 15:22:19'),
(23, 87, NULL, 'APP_1772206679_87_ED3DC6', 0.10, 'NGN', 'pending', 'paystack', 'study_abroad', '{\"case_type\":\"study_abroad\",\"title\":\"MSC in Accounting and Finance\",\"description\":\"\",\"destination_country\":\"United Kingdom\",\"institution\":\"University Of Wolverhampton\",\"program\":\"MSC in Accounting\",\"intake\":\"May\",\"amount\":0.1000000000000000055511151231257827021181583404541015625,\"commission\":0.01000000000000000020816681711721685132943093776702880859375}', NULL, '2026-02-27 16:37:59'),
(24, 87, NULL, 'APP_1772206780_87_751BC7', 0.10, 'NGN', 'pending', 'paystack', 'study_abroad', '{\"case_type\":\"study_abroad\",\"title\":\"MSC in Accounting and Finance\",\"description\":\"\",\"destination_country\":\"United Kingdom\",\"institution\":\"University Of Wolverhampton\",\"program\":\"MSC in Accounting\",\"intake\":\"May\",\"amount\":0.1000000000000000055511151231257827021181583404541015625,\"commission\":0.01000000000000000020816681711721685132943093776702880859375}', NULL, '2026-02-27 16:39:40'),
(25, 32, NULL, 'APP_1772621705_32_257B48', 100.00, 'NGN', 'pending', 'paystack', 'study_abroad', '{\"case_type\":\"study_abroad\",\"title\":\"study in france\",\"description\":\"\",\"destination_country\":\"France\",\"institution\":\"NIL\",\"program\":\"project management\",\"intake\":\"May\",\"amount\":100,\"commission\":10}', NULL, '2026-03-04 11:55:05'),
(26, 55, NULL, 'APP_1777694616_55_C027FE', 100.00, 'NGN', 'pending', 'paystack', 'study_abroad', '{\"case_type\":\"study_abroad\",\"title\":\"2026 September \",\"description\":\"\",\"destination_country\":\"Australia\",\"institution\":\"\",\"program\":\"\",\"intake\":\"September\",\"amount\":100,\"commission\":10}', NULL, '2026-05-02 05:03:36'),
(27, 107, NULL, 'APP_1777816166_107_886297', 100.00, 'NGN', 'pending', 'paystack', 'visa_tourist', '{\"case_type\":\"visa_tourist\",\"title\":\"Work\",\"description\":\"\",\"destination_country\":\"Canada\",\"institution\":\"University of lagos\",\"program\":\"Human kinetic and heaith education\",\"intake\":\"\",\"amount\":100,\"commission\":10}', NULL, '2026-05-03 14:49:26');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `base_price` decimal(12,2) DEFAULT 0.00,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `name`, `description`, `base_price`, `is_active`, `created_at`) VALUES
(1, 'AUSTRALIA Certificate III Training Pathway', '', 10000.00, 1, '2026-01-17 19:40:14');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_group` varchar(50) DEFAULT 'general',
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `setting_key`, `setting_value`, `setting_group`, `updated_at`, `updated_by`, `description`) VALUES
(1, 'case_amount_study_abroad', '40000', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(2, 'case_commission_study_abroad', '0', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(3, 'case_commission_percent_study_abroad', '10', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(4, 'case_amount_visa_student', '30000', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(5, 'case_commission_visa_student', '0', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(6, 'case_commission_percent_visa_student', '10', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(7, 'case_amount_visa_tourist', '0', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(8, 'case_commission_visa_tourist', '0', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(9, 'case_commission_percent_visa_tourist', '10', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(10, 'case_amount_visa_family', '0', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(11, 'case_commission_visa_family', '0', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(12, 'case_commission_percent_visa_family', '10', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(13, 'case_amount_travel_booking', '0', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(14, 'case_commission_travel_booking', '0', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(15, 'case_commission_percent_travel_booking', '10', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(16, 'case_amount_pilgrimage', '0', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(17, 'case_commission_pilgrimage', '0', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(18, 'case_commission_percent_pilgrimage', '10', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(19, 'case_amount_other', '0', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(20, 'case_commission_other', '0', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(21, 'case_commission_percent_other', '10', 'case_pricing', '2025-12-31 13:45:13', 1, NULL),
(43, 'loan_min_amount', '100000', 'general', '2026-01-09 10:26:56', NULL, 'Minimum loan amount in NGN'),
(44, 'loan_max_amount', '5000000', 'general', '2026-01-09 10:26:56', NULL, 'Maximum loan amount in NGN'),
(45, 'loan_default_interest_rate', '15', 'general', '2026-01-09 10:26:56', NULL, 'Default annual interest rate for loans (%)'),
(46, 'loan_max_duration', '36', 'general', '2026-01-09 10:26:56', NULL, 'Maximum loan duration in months'),
(47, 'loan_processing_fee', '5000', 'general', '2026-01-09 10:26:56', NULL, 'Loan application processing fee in NGN'),
(48, 'loan_case_amount_student_loan', '2500', 'general', '2026-01-09 10:26:56', NULL, 'Case amount for student loan applications'),
(49, 'loan_case_commission_student_loan', '500', 'general', '2026-01-09 10:26:56', NULL, 'Fixed commission for student loan applications'),
(50, 'loan_case_commission_percent_student_loan', '10', 'general', '2026-01-09 10:26:56', NULL, 'Commission percentage for student loans'),
(51, 'site_name', 'ApplyBoard Africa', 'system', '2026-01-22 19:32:33', 1, NULL),
(52, 'site_email', 'info@applyboardafrica.com', 'system', '2026-01-22 19:32:33', 1, NULL),
(53, 'site_phone', '+2347063459820', 'system', '2026-01-22 19:32:33', 1, NULL),
(54, 'maintenance_mode', '0', 'system', '2026-01-22 19:32:33', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `id` int(11) NOT NULL,
  `fullname` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'staff',
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL COMMENT 'Password reset token',
  `reset_expires` datetime DEFAULT NULL COMMENT 'Password reset token expiration'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`id`, `fullname`, `email`, `phone`, `password`, `role`, `permissions`, `is_active`, `last_login`, `created_at`, `updated_at`, `created_by`, `reset_token`, `reset_expires`) VALUES
(1, 'Heather Walls', 'ikechukwuv052+apply@gmail.com', '+1 (552) 196-4406', '00000000', 'staff', '[\"view_cases\",\"manage_cases\",\"view_clients\",\"view_agents\",\"view_inquiries\",\"view_reports\",\"view_notifications\"]', 1, '2026-01-15 20:31:01', '2026-01-15 17:37:12', '2026-01-15 20:31:01', 1, '493584df7981411242279043ff86e389536bb30f52a41e5b2a7a1fcba881b50c', '2026-01-15 21:29:52'),
(2, 'dominique', 'admin@admin.com', '+2348022133719', 'admin123', 'staff', '[\"view_cases\",\"manage_cases\",\"view_clients\",\"view_agents\",\"view_inquiries\",\"view_reports\",\"view_notifications\"]', 1, NULL, '2026-01-17 19:55:15', '2026-01-17 19:55:15', 1, NULL, NULL),
(3, 'Titilayo Oluwatomiwa', 'moveabroadlink@gmail.com', '+2347082502913', '7082502913', 'staff', '[\"view_cases\",\"manage_cases\",\"view_clients\",\"view_agents\",\"view_inquiries\",\"view_reports\",\"view_notifications\"]', 1, '2026-02-19 08:14:50', '2026-02-12 16:12:56', '2026-02-24 11:59:25', 1, NULL, NULL),
(4, 'Titilayo Oluwatomiwa Emmanuel', 'admissions@applyboardafrica.com', '+2347082502913', 'Nigeria@2026', 'staff', '[\"view_cases\",\"manage_cases\",\"view_clients\",\"view_agents\",\"view_inquiries\",\"view_reports\",\"view_notifications\"]', 1, NULL, '2026-02-27 14:57:54', '2026-02-27 14:58:36', 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_loans`
--

CREATE TABLE `student_loans` (
  `id` int(11) NOT NULL,
  `loan_number` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `case_id` int(11) DEFAULT NULL COMMENT 'Linked case if applicable',
  `loan_type` enum('tuition','living_expenses','full_program','travel','other') NOT NULL DEFAULT 'tuition',
  `loan_amount_requested` decimal(12,2) NOT NULL,
  `loan_amount_approved` decimal(12,2) DEFAULT NULL,
  `currency` varchar(10) NOT NULL DEFAULT 'NGN',
  `purpose` text DEFAULT NULL COMMENT 'Purpose of the loan',
  `program_name` varchar(255) DEFAULT NULL COMMENT 'Program being funded',
  `institution_name` varchar(255) DEFAULT NULL COMMENT 'Institution/University',
  `course_duration` int(11) DEFAULT NULL COMMENT 'Duration in months',
  `program_start_date` date DEFAULT NULL,
  `program_end_date` date DEFAULT NULL,
  `full_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `nationality` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `employment_status` enum('employed','self_employed','unemployed','student','other') NOT NULL DEFAULT 'student',
  `employer_name` varchar(255) DEFAULT NULL,
  `monthly_income` decimal(12,2) DEFAULT NULL,
  `income_source` varchar(255) DEFAULT NULL,
  `has_collateral` tinyint(1) DEFAULT 0,
  `collateral_type` varchar(255) DEFAULT NULL,
  `collateral_value` decimal(12,2) DEFAULT NULL,
  `has_guarantor` tinyint(1) DEFAULT 0,
  `guarantor_name` varchar(255) DEFAULT NULL,
  `guarantor_email` varchar(255) DEFAULT NULL,
  `guarantor_phone` varchar(50) DEFAULT NULL,
  `guarantor_relationship` varchar(100) DEFAULT NULL,
  `guarantor_address` text DEFAULT NULL,
  `repayment_period` int(11) DEFAULT NULL COMMENT 'Repayment period in months',
  `interest_rate` decimal(5,2) DEFAULT NULL COMMENT 'Annual interest rate',
  `monthly_repayment` decimal(12,2) DEFAULT NULL,
  `grace_period` int(11) DEFAULT 6 COMMENT 'Grace period in months before repayment starts',
  `status` enum('draft','pending','under_review','approved','rejected','disbursed','repaying','completed','defaulted') NOT NULL DEFAULT 'pending',
  `submission_date` datetime DEFAULT NULL,
  `review_date` datetime DEFAULT NULL,
  `approval_date` datetime DEFAULT NULL,
  `disbursement_date` datetime DEFAULT NULL,
  `disbursement_method` varchar(100) DEFAULT NULL,
  `disbursement_reference` varchar(255) DEFAULT NULL,
  `total_repaid` decimal(12,2) DEFAULT 0.00,
  `remaining_balance` decimal(12,2) DEFAULT NULL,
  `next_payment_due` date DEFAULT NULL,
  `last_payment_date` date DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `admin_notes` text DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `documents_submitted` text DEFAULT NULL COMMENT 'JSON array of submitted document types',
  `documents_verified` tinyint(1) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `bank_name` varchar(255) DEFAULT NULL,
  `account_number` varchar(20) DEFAULT NULL,
  `account_name` varchar(255) DEFAULT NULL,
  `account_type` enum('savings','current') DEFAULT 'savings'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_loans`
--

INSERT INTO `student_loans` (`id`, `loan_number`, `user_id`, `case_id`, `loan_type`, `loan_amount_requested`, `loan_amount_approved`, `currency`, `purpose`, `program_name`, `institution_name`, `course_duration`, `program_start_date`, `program_end_date`, `full_name`, `email`, `phone`, `date_of_birth`, `nationality`, `address`, `city`, `state`, `country`, `employment_status`, `employer_name`, `monthly_income`, `income_source`, `has_collateral`, `collateral_type`, `collateral_value`, `has_guarantor`, `guarantor_name`, `guarantor_email`, `guarantor_phone`, `guarantor_relationship`, `guarantor_address`, `repayment_period`, `interest_rate`, `monthly_repayment`, `grace_period`, `status`, `submission_date`, `review_date`, `approval_date`, `disbursement_date`, `disbursement_method`, `disbursement_reference`, `total_repaid`, `remaining_balance`, `next_payment_due`, `last_payment_date`, `review_notes`, `rejection_reason`, `admin_notes`, `reviewed_by`, `approved_by`, `documents_submitted`, `documents_verified`, `created_at`, `updated_at`, `bank_name`, `account_number`, `account_name`, `account_type`) VALUES
(1, 'ABA-L-1767952089279', 4, NULL, 'travel', 200000.00, NULL, 'NGN', 'Ex cupiditate ducimu', 'Illana Gray', 'Ezekiel Doyle', 2, '2003-06-11', '2000-11-13', 'Zorita Osborn', 'junyhe@example.com', NULL, NULL, 'Nigeria', '', '', '', 'Nigeria', 'student', NULL, 10000.00, 'parents', 0, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 6, 'pending', '2026-01-09 10:48:09', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-01-09 10:48:09', '2026-01-09 10:48:09', NULL, NULL, NULL, 'savings'),
(2, 'ABA-L-1767958165510', 4, NULL, 'living_expenses', 390.38, NULL, 'USD', 'Minim veniam aliqui', 'Maryam Le', 'Melodie Weaver', 2, '1999-10-12', '2024-01-14', 'Zorita Osborn', 'junyhe@example.com', NULL, NULL, 'Nigeria', NULL, NULL, NULL, 'Nigeria', 'self_employed', 'Mallory Henry', 345.44, '91', 1, 'Ea dolorem sequi id', 5.89, 1, 'Maile Bruce', 'dequkufiz@example.com', '+1 (621) 171-2196', 'Quasi est rerum ame', '921 Oak Extension', NULL, NULL, NULL, 6, 'pending', '2026-01-09 12:29:25', NULL, NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-01-09 12:29:25', '2026-01-09 12:29:41', 'Guaranty Trust Bank (GTB)', '2044664647', 'Priscilla Clayton', 'current'),
(3, 'ABA-L-1767962339699', 4, NULL, 'travel', 629000.00, NULL, 'CAD', 'Fugiat laborum maior', 'Mechelle Melton', 'Renee White', 2, '2000-01-21', '2022-09-10', 'Zorita Osborn', 'junyhe@example.com', NULL, NULL, 'Nigeria', NULL, NULL, NULL, 'Nigeria', 'other', 'Charissa Forbes', 139.93, '553', 1, 'Quod laboriosam omn', 5.27, 0, NULL, NULL, NULL, NULL, NULL, 6, 15.00, NULL, 6, 'under_review', '2026-01-09 13:38:59', '2026-01-09 13:47:10', NULL, NULL, NULL, NULL, 0.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, '2026-01-09 13:38:59', '2026-01-09 13:47:10', 'First Bank of Nigeria', '8057557577', 'Neil Edwards', 'current');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `userid` varchar(30) NOT NULL,
  `fullname` varchar(150) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `agent_id` int(11) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `passport_number` varchar(100) DEFAULT NULL,
  `profile_complete` tinyint(1) NOT NULL DEFAULT 0,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `userid`, `fullname`, `email`, `phone`, `password`, `created_at`, `agent_id`, `country`, `city`, `address`, `date_of_birth`, `passport_number`, `profile_complete`, `reset_token`, `reset_expires`) VALUES
(1, '67e3d4d10fa8c', 'Vic Ike', 'ikechukwuv052+test@gmail.com', NULL, '000000', '2025-03-26 11:20:01', NULL, NULL, NULL, NULL, NULL, NULL, 0, '52e7c7b68631f62c1b0e74108252c1239228929c4be5509ceb77746dac9b1849', '2026-01-15 21:00:47'),
(2, '67ed81b13502b', 'Rhoda Hardin', 'fobu@example.com', NULL, '000000', '2025-04-02 19:28:01', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(3, '694daa1309691', 'Bernard Kelly', 'abc@gmail.com', NULL, '00000000', '2025-12-25 22:18:11', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(4, 'USR6953d64b7d8d6', 'Zorita Osborn', 'junyhe@example.com', NULL, '00000000', '2025-12-30 14:40:27', 1, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(5, '6956ef122aba4', 'Charles Benjamin', 'bebefuw@example.com', NULL, 'Password123', '2026-01-01 23:02:58', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(6, 'USR696a0e24c14ed', 'Adebayo Oluwaseun Gabriel', 'ardeybaryor2000@gmail.com', '08038086379', 'gabriel85', '2026-01-16 11:08:36', NULL, 'Nigeria', 'Ido-Ekiti ', 'Abare Estate Orin-Ekiti road, Ido-Ekiti ', NULL, NULL, 0, NULL, NULL),
(7, 'USR696a10518d4f0', 'Temitope Adeyemo', 'temitope.adeyemo84@gmail.com', NULL, 'Temidundola1415', '2026-01-16 11:17:53', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(8, 'USR696aaf3b4facc', 'Ayodeji Hellen Osmond', 'ayodejihellen12@yahoo.com', NULL, 'Famous@2020$', '2026-01-16 22:35:55', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(9, 'USR696bdbe0efcef', 'pella Dominique', 'doraldinef@gmail.com', NULL, '676412704', '2026-01-17 19:58:40', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(10, 'USR696d2469bb778', 'Mustapha Goni', 'mustyaji360@yahoo.com', NULL, 'Online@1980', '2026-01-18 19:20:25', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(11, 'USR696d254ee9c38', 'Aisagbonbu Charity Ogbodu', 'ogboduosase@gmail.com', NULL, 'Osase9898@', '2026-01-18 19:24:14', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(12, 'USR696e0d93d427a', 'Jewel Soyemi', 'tiarajules8@gmail.com', NULL, 'Jewel1994@', '2026-01-19 11:55:15', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(13, 'USR696e293e3bc0c', 'Oyeniyi Timothy olusayo', 'ebuntimlove@gmail.com', NULL, 'Everlove@24', '2026-01-19 13:53:18', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(14, 'USR696e48c391e73', 'Okokon Okon Jacob', 'okokonokonjacob@gmail.com', NULL, 'taraba1000', '2026-01-19 16:07:47', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(15, 'USR696e51128a184', 'Chizaram Kalu', 'ellalovekalu@gmail.com', NULL, 'Chizaram3939', '2026-01-19 16:43:14', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(16, 'USR696e5260c3f08', 'Olotu Ijela Kindness', 'olotuije@gmail.com', NULL, '241987', '2026-01-19 16:48:48', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(17, 'USR696e52ac92b56', 'Olotu Ijela Kindness', 'olotuijelakindness@gmail.com', NULL, '241987', '2026-01-19 16:50:04', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(18, 'USR696e53460619a', 'ENYINNAYA OSUJI', 'enyinnaosuji@gmail.com', NULL, '1234567', '2026-01-19 16:52:38', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(19, 'USR696e6c93d955a', 'Fubara Peters', 'petersfubara@yahoo.com', NULL, 'astute', '2026-01-19 18:40:35', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(20, 'USR696f52633de53', 'Ajayi olajumoke I', 'ajayiifeoluwapo2016@gmail.com', NULL, 'Lollyfat@99', '2026-01-20 11:01:07', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(21, 'USR696f64f276c8a', 'digitide', 'digitidetechnologies@gmail.com', NULL, 'My@247', '2026-01-20 12:20:18', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(22, 'USR696f68f4794dd', 'Japhet Udochukwu Ekpo', 'blessingchidi646@gmail.com', NULL, 'pastor10E', '2026-01-20 12:37:24', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(23, 'USR696fc94b45c82', 'Samagidi Rukevwe Kenneth', 'kennethsamagidi@gmail.com', NULL, 'Kenneth,0513.', '2026-01-20 19:28:27', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(24, 'USR697098ed887db', 'Feyisara Tunji John', 'feyisaratee@gmail.com', NULL, 'Nimi2014', '2026-01-21 10:14:21', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(25, 'USR69709e7dc9ab9', 'Jadon Chukwujide Umeri', 'umerijadon@gmail.com', NULL, 'Dajayclan321', '2026-01-21 10:38:05', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(26, 'USR6970a551155cd', 'Chinelo Anita Ikeh', 'chineloikeh@gmail.com', NULL, 'Ihejirika@01', '2026-01-21 11:07:13', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(27, 'USR6970a8e93fb8c', 'Alabi oluwaronke oyesola', 'oluronke4christ2019@gmail.com', NULL, '326500', '2026-01-21 11:22:33', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(28, 'USR6970b6c3db160', 'Chukwuma Joseph Arua', 'chuksuju3@gmail.com', NULL, 'Samaramarisa0331@', '2026-01-21 12:21:39', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(29, 'USR6970b6c5e11e4', 'Real Adeola', 'oluwafeyikemiisaac@gmail.com', NULL, 'Oluwafeyikemi@29', '2026-01-21 12:21:41', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(30, 'USR697109a5b066f', 'Mama Esteetade', 'esteetadetravels@gmail.com', NULL, '08032300533', '2026-01-21 18:15:17', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(31, 'USR6971159cedc4b', 'Oluwatobi Oguntade', 'oluwatobijohn777@gmail.com', NULL, '781227', '2026-01-21 19:06:20', 7, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(32, 'USR6971184e31b97', 'domin', 'pelladominiqueoluwa@gmail.com', NULL, '676412704', '2026-01-21 19:17:50', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(33, 'USR6971f4b7092ee', 'Solomon Ugochukwu Edeh', 'solomediaugochuks@gmail.com', NULL, 'odogwu1987', '2026-01-22 10:58:15', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(34, 'USR6972189e21a2b', 'Ifeoma Nwafor', 'zoej2075@gmail.com', NULL, 'LoVe@2075', '2026-01-22 13:31:26', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(35, 'USR697257a80245a', 'Dondoan Nguevese Emmanuella', 'edondoan78@gmail.com', NULL, 'Donvelma78@', '2026-01-22 18:00:24', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(36, 'USR69729f9b9364d', 'Adesola Tosin Martins', 'martinsvirat@gmail.com', NULL, 'Desktop1@', '2026-01-22 23:07:23', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(37, 'USR697316278bda5', 'Musa Muhammad Sanda', 'itsmsanda@gmail.com', NULL, 'Mms113400#', '2026-01-23 07:33:11', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(38, 'USR6973516433cc3', 'MADUEKE SABINA NJIDEKA', 'giftqueen000@gmail.com', NULL, 'Sabina@123', '2026-01-23 11:45:56', 7, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(39, 'USR697356a5098a1', 'Mmachi Greatness Peters', 'greatnesspeters9@gmail.com', NULL, 'Mmachi@123', '2026-01-23 12:08:21', 7, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(40, 'USR697358999007f', 'OKEBOWALE BOLAJI AKOREDE', 'okebowalebolaji@gmail.com', NULL, 'Okebowale@123', '2026-01-23 12:16:41', 7, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(41, 'USR69735c5477b14', 'Marvellous Titilope Abu', 'feyisayoabu@gmail.com', NULL, '<ARVELLOUS@123', '2026-01-23 12:32:36', 7, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(42, 'USR69735dd196541', 'Ukwueze Victor Chiderah', 'chiderahemerson1995@gmail.com', NULL, 'Chiderah1995#', '2026-01-23 12:38:57', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(43, 'USR697361ddb68a6', 'OLUWASEUN MOJIRAYO AJAYI', 'oluwaseunmoji11@gmail.com', NULL, 'Oluwaseun2123', '2026-01-23 12:56:13', 7, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(44, 'USR697366327296c', 'OSUYA SPENCER SEUN', 'spencerchuks31@gmail.com', NULL, 'Osuya@123', '2026-01-23 13:14:42', 7, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(45, 'USR697371c5eee5f', 'Joy Odije Bisong', 'joybisong27@gmail.com', NULL, 'joy1796717967', '2026-01-23 14:04:05', 9, NULL, NULL, NULL, NULL, NULL, 0, '5298cf1bcab76cc9595db84698dd1d28c3310be28402ccb3f21428a7ac640801', '2026-03-09 11:04:56'),
(46, 'USR6973845492c11', 'oshiyoye oyeyemi olushola', 'oshiyoyeolushola3@gmail.com', NULL, 'Mamag_83', '2026-01-23 15:23:16', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(47, 'USR6973dd804c76f', 'Aminat Oyeronke Mba', 'oladeboronke@gmail.com', NULL, 'Gold@100', '2026-01-23 21:43:44', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(48, 'USR6974769e01b4d', 'Moses Godo Peter', 'babatundemoses631@gmail.com', NULL, 'Anabel2009', '2026-01-24 08:37:02', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(49, 'USR6974e1cc7ed50', 'Odemwingie Ruth Rejoice', 'rejoiceruth347@gmail.com', NULL, 'lovegreat', '2026-01-24 16:14:20', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(50, 'USR697756914f2ee', 'Chigozie onyebuchi Iheonukara', 'onyebuchichigozie126@gmail.com', NULL, 'FTMM1989', '2026-01-26 12:57:05', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(51, 'USR69775bee57879', 'Jegede Florence Oluwatoyin', 'phloxyj@gmail.com', NULL, 'Oluwatoyin_20@', '2026-01-26 13:19:58', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(52, 'USR69776ab606516', 'Babadele Ladipo', 'olawalebabadele@yahoo.com', NULL, 'omolade23', '2026-01-26 14:23:02', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(53, 'USR6978a2e680bd9', 'Ugbomhe Emmanuel Oghie', 'ugbomhe@aol.com', NULL, 'Helpgod11@', '2026-01-27 12:35:02', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(54, 'USR697de91d490a3', 'Igwe Chijioke Charles', 'Cjohn8270@gmail.com', '+2347035344528', 'SAP*1CHIJII03', '2026-01-31 12:35:57', NULL, 'Nigeria', 'Porthercourt ', '2nd pipeline ogbodo road Porthercourt Rivers ', NULL, NULL, 0, NULL, NULL),
(55, 'USR69815e9f0b34a', 'Abraham Aramude', 'aramudeabraham@gmail.com', '+2349073002786', 'eromosele', '2026-02-03 03:34:07', NULL, 'Nigeria', 'Benin City ', 'Evbekoi community off auchi Express road Edo State Benin City Nigeria ', NULL, NULL, 0, NULL, NULL),
(56, 'USR69819ad08589e', 'Benjamin Munachi Njoku', 'benjaminmunachi72@gmail.com', NULL, 'agama12345', '2026-02-03 07:50:56', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(57, 'USR6981ba42877c3', 'Aminat Bakare-Michael', 'bakareaminata@gmail.com', NULL, 'nikesisteR1', '2026-02-03 10:05:06', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(58, 'USR698243df4cd34', 'Ehiogie Precious Osasumwen', 'ehiogieprecious@gmail.com', NULL, 'Ultimate@2022', '2026-02-03 19:52:15', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(59, 'USR6982588b5af4c', 'Busari Nafisat Teniola', 'teniolabusari98@gmail.com', NULL, 'tenny.', '2026-02-03 21:20:27', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(60, 'USR6986306d2e7c1', 'Blessing Ayimba', 'blessyn.ayimba@gmail.com', '', 'prosper', '2026-02-06 19:18:21', NULL, 'Nigeria', 'Abuja ', '', NULL, NULL, 0, NULL, NULL),
(61, 'USR69865faaacc52', 'Emily Omoruyi', 'omoruyiemily79@gmail.com', NULL, 'Adesuwa@2018', '2026-02-06 22:39:54', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(62, 'USR6986d9d7eb788', 'Damilare Joseph', 'damilarejoseph441@gmail.com', NULL, 'boboye08', '2026-02-07 07:21:11', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(63, 'USR6986da0e57939', 'Damilare Joseph', 'dharmiejoe86@gmail.com', NULL, 'boboye08', '2026-02-07 07:22:06', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(64, 'USR698c5dd8e660b', 'Mustapha Opeyemi', 'mustapha@gmail.com', NULL, 'Jessica@17967', '2026-02-11 11:45:44', 9, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(65, 'USR698cbeea80ed7', 'Uchechukwu Chidinma', 'favourdimma61@gmail.com', NULL, 'Man4djob', '2026-02-11 18:39:54', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(66, 'USR69909c8bcd452', 'Manly Nwabueze Vincent', 'infogreentevaconsult@gmail.com', NULL, 'Nwa1979', '2026-02-14 17:02:19', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(67, 'USR6992eba8c3cfe', 'Nathan Nkuma', 'nathannkuma3@gmail.com', NULL, 'Possible2026', '2026-02-16 11:04:24', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(68, 'USR6992ec5530f4e', 'Dic-Isotu Royinte Moses', 'mosesroyinte@gmail.com', NULL, 'sazryw-bywsuR-fibhe3', '2026-02-16 11:07:17', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(69, 'USR69931767a210f', 'Ngozika', 'ngozikangoka5@gmail.com', NULL, 'jecinta', '2026-02-16 14:11:03', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(70, 'USR699363999a82a', 'IREGBU Bright chisom', 'hpdelightgold@gmail.com', NULL, 'Chisom123@', '2026-02-16 19:36:09', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(71, 'USR69936441ee191', 'IREGBU Bright chisom', 'Brightcruz@gmail.com', NULL, 'Chisom123@', '2026-02-16 19:38:57', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(72, 'USR69939a5e8f832', 'Emem Ukpong', 'adeola@applyboardafrica.com', NULL, 'Adeola@2026', '2026-02-16 23:29:50', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(73, 'USR69943b9789d49', 'Ayeni Timilehin Elizabeth', 'ayenitimicash2000@gmail.com', NULL, 'Timi_011', '2026-02-17 10:57:43', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(74, 'USR69945e7927c11', 'Muhammad', 'Saniinuwa19998@gmail.com', NULL, '196812', '2026-02-17 13:26:33', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(75, 'USR6994777ceeccc', 'Abigail Thomas Archibong', 'archibongabigail817@gmail.com', '08130230756', 'abi00112233', '2026-02-17 15:13:16', NULL, 'Nigeria', 'Calabar', 'No 12 Abasi akara street', NULL, NULL, 0, NULL, NULL),
(76, 'USR699483a1abc37', 'Abdulwasiu Kehinde Abdulsalam', 'abdulsalamkenny120@gmail.com', NULL, 'Olamide07', '2026-02-17 16:05:05', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(77, 'USR699585b5c5fcc', 'Williams Taa', 'daycare058@gmail.com', NULL, 'mother020', '2026-02-18 10:26:13', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(78, 'USR699595e3b5145', 'Iheanyi Goodluck', 'iheanyigoodluck73@gmail.com', NULL, '76691287FBMictu@', '2026-02-18 11:35:15', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(79, 'USR6995a6dd6dab1', 'Muhammad Haruna Almu', 'mhak5859@gmail.com', NULL, '5859#+Hh', '2026-02-18 12:47:41', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(80, 'USR699c4baeeb5e2', 'Raji Olaitan', 'rajiolaitan2@yahoo.com', NULL, 'Ekunaperin87,', '2026-02-23 13:44:30', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(81, 'USR699c58c572c3e', 'Adebonojo Abigail Adetutu', 'abigailadebonojo1@gmail.com', NULL, '@IneedHelp4rmGod', '2026-02-23 14:40:21', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(82, 'USR699cb0f0e9292', 'Oloruntoba Samuel Kola', 'samueloloruntoba45@gmail.com', NULL, 'Bamifeyisayo17#', '2026-02-23 20:56:32', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(83, 'USR699df2c90fb73', 'info', 'ngwudikeekene@gmail.com', NULL, '000000', '2026-02-24 19:49:45', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(84, 'USR699e07939086d', 'Obinna Innocent', 'innocentarthurobinna@gmail.com', NULL, '246810', '2026-02-24 21:18:27', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(85, 'USR69a063e1841e5', 'Toyin  Ayodele Anifowose', 'anifsont@yahoo.com', '07032119346', 'Blessed88##', '2026-02-26 16:16:49', NULL, 'Nigeria', 'ETCHE', '1, Behind Goldsprings, Ikwerre Ngo, Etche, Rivers State, Nigeria.', NULL, NULL, 0, NULL, NULL),
(86, 'USR69a1b1e9d9000', 'Adigun Akinwumi Kasim', 'kasimarsenal@yahoo.com', NULL, 'Akin1578', '2026-02-27 16:02:01', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(87, 'USR69a1b4b256a96', 'OLUWABUSUYI SEYI DANIEL', 'seyidgreatplanner@gmail.com', NULL, 'Oluwabusuyi1', '2026-02-27 16:13:54', 12, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(88, 'USR69a1b7e00b394', 'FLORENCE FOLASHADE ADENIRAN', 'florenceadeniran30@gmail.com', NULL, 'FLORENCE1', '2026-02-27 16:27:28', 12, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(89, 'USR69a367c17ff3b', 'OIWOH MICHAEL OSENONOME', 'oiwoh.michael@gmail.com', NULL, 'Finestboy$1', '2026-02-28 23:10:09', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(90, 'USR69a4b182b1b2e', 'AFOLABI OLAYEMI ADEYINKA', 'olayemiafolabi45@gmail.com', NULL, 'adeyinka02', '2026-03-01 22:37:06', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(91, 'USR69a55881dcae4', 'Akachukwu Godspeace Chijindu', 'akachukwugodspeace@gmail.com', NULL, 'akapeace06', '2026-03-02 10:29:37', 12, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(92, 'USR69a983cb9e66e', 'florence', 'ojeniyifolashade1@gmail.com', NULL, 'Florencecanada1', '2026-03-05 14:23:23', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(93, 'USR69ac1d4d9f9b0', 'Nnaya Ozioma Ruth', 'oziomaruth39@gmail.com', NULL, 'Ruth&2', '2026-03-07 13:42:53', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(94, 'USR69ac3fdddb0db', 'Immaculata', 'immaculataaghogho@gmail.com', NULL, 'Zyon@2023', '2026-03-07 16:10:21', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(95, 'USR69ac597bbeeaf', 'Alfred Ayokunle', 'gmulf111@gmail.com', NULL, 'arterxerxes', '2026-03-07 17:59:39', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(96, 'USR69ac5c908eac8', 'Mustapha kazeem adetola', 'mustaphakazeemadetola011@gmail.com', NULL, 'Adetola001', '2026-03-07 18:12:48', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(97, 'USR69ac8397ebe81', 'Adeyemo Kehinde', 'adeyemokennylee@gmail.com', NULL, 'Adeyemo@2', '2026-03-07 20:59:19', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(98, 'USR69ac98549b159', 'Dare Michael Dada', 'daredada95@gmail.com', NULL, 'Iwillmakeit', '2026-03-07 22:27:48', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(99, 'USR69acd59ec0dfa', 'Noah Michael obanla', 'obanlamichael1234@gmail.com', NULL, 'noah123', '2026-03-08 02:49:18', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(100, 'USR69ad3b8f32778', 'Orji Ugochi Eucharia', 'orjiugochi528@gmail.com', NULL, 'qijvym-mygriZ-9qevtu', '2026-03-08 10:04:15', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(101, 'USR69b4bfed203ef', 'Friday Fleming Caleb Imafidor', 'imaflemming@gmail.com', NULL, 'Mascot@1648', '2026-03-14 02:54:53', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(102, 'USR69be78df52aa0', 'Angela Ngozi Omega', 'donjesus46@gmail.com', NULL, 'Ngozikadon2001', '2026-03-21 11:54:23', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(103, 'USR69d2950a21a75', 'Collins', 'maduiwegbu2@gmail.com', NULL, 'payment123', '2026-04-05 17:59:54', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(104, 'USR69d9743f8e899', 'Olobashola Ayodele sunday', 'ayodeleproj@gmail.com', NULL, '199230Ay', '2026-04-10 23:05:51', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(105, 'USR69dfa20aee113', 'Hshs', 'moontontlol321@gmail.com', '', 'bokep123', '2026-04-15 15:34:50', NULL, '', '', '', NULL, NULL, 0, NULL, NULL),
(106, 'USR69e16de6731f9', 'Chidera Felicitas Osita', 'chideraosita147@gmail.com', NULL, 'DeraO732000@', '2026-04-17 00:16:54', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL),
(107, 'USR69f75189a3e5e', 'Mubarak olawale oluwaseun', 'olawaleolota2@gmail.com', NULL, 'atanda', '2026-05-03 14:45:45', NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_user_type` (`user_type`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_entity_type` (`entity_type`),
  ADD KEY `idx_entity_id` (`entity_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `agents`
--
ALTER TABLE `agents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `agent_code` (`agent_code`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `agent_performance`
--
ALTER TABLE `agent_performance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `agent_id` (`agent_id`),
  ADD KEY `idx_agent_id` (`agent_id`);

--
-- Indexes for table `blog_categories`
--
ALTER TABLE `blog_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_slug` (`slug`);

--
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_featured` (`featured`),
  ADD KEY `idx_slug` (`slug`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `cases`
--
ALTER TABLE `cases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `case_number` (`case_number`),
  ADD KEY `idx_client_id` (`client_id`),
  ADD KEY `idx_agent_id` (`agent_id`),
  ADD KEY `idx_case_type` (`case_type`),
  ADD KEY `idx_stage` (`stage`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `case_stages_history`
--
ALTER TABLE `case_stages_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_case_id` (`case_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `case_types`
--
ALTER TABLE `case_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `type_key` (`type_key`),
  ADD UNIQUE KEY `idx_type_key` (`type_key`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_sort_order` (`sort_order`);

--
-- Indexes for table `commissions`
--
ALTER TABLE `commissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_agent_id` (`agent_id`),
  ADD KEY `idx_case_id` (`case_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_case_id` (`case_id`),
  ADD KEY `idx_client_id` (`client_id`),
  ADD KEY `idx_document_type` (`document_type`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `loan_documents`
--
ALTER TABLE `loan_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_loan_id` (`loan_id`),
  ADD KEY `idx_document_type` (`document_type`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `loan_repayments`
--
ALTER TABLE `loan_repayments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payment_reference` (`payment_reference`),
  ADD KEY `idx_loan_id` (`loan_id`),
  ADD KEY `idx_payment_reference` (`payment_reference`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_payment_date` (`payment_date`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_user_type` (`user_type`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference` (`reference`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_case_id` (`case_id`),
  ADD KEY `idx_reference` (`reference`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_setting_group` (`setting_group`),
  ADD KEY `idx_setting_key` (`setting_key`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `idx_email` (`email`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_reset_token` (`reset_token`);

--
-- Indexes for table `student_loans`
--
ALTER TABLE `student_loans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `loan_number` (`loan_number`),
  ADD UNIQUE KEY `loan_number_2` (`loan_number`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_case_id` (`case_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_submission_date` (`submission_date`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=328;

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `agents`
--
ALTER TABLE `agents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `agent_performance`
--
ALTER TABLE `agent_performance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `blog_categories`
--
ALTER TABLE `blog_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `cases`
--
ALTER TABLE `cases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `case_stages_history`
--
ALTER TABLE `case_stages_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `case_types`
--
ALTER TABLE `case_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `commissions`
--
ALTER TABLE `commissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `inquiries`
--
ALTER TABLE `inquiries`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `loan_documents`
--
ALTER TABLE `loan_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `loan_repayments`
--
ALTER TABLE `loan_repayments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student_loans`
--
ALTER TABLE `student_loans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=108;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
