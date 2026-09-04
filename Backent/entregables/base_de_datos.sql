-- ========================================================
-- SISTEMA DE GESTION DE INSPECCIONES DE HIGIENE Y SEGURIDAD LABORAL
-- SCRIPT DE BASE DE DATOS CON ESTRUCTURA Y DATOS DE PRUEBA
-- Compatible con MySQL 5.7+ / MySQL 8.0+ / MariaDB
-- Generado: 2026-09-03 19:56:51
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Estructura para la tabla `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `role` varchar(50) NOT NULL DEFAULT 'inspector',
  `phone` varchar(50) DEFAULT NULL,
  `license_number` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `avatar` varchar(255) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcado de datos para la tabla `users`
INSERT INTO `users` (`id`, `name`, `email`, `role`, `phone`, `license_number`, `is_active`, `avatar`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES ('1', 'Ing. Alejandro Morales', 'admin@seguridad.local', 'admin', '+54 11 4455-6677', 'MAT-NAC-00192', '1', NULL, NULL, '$2y$12$FDlnj2yuzTeoOZD5F63dMOEKlCzlNng/6tEZzbjTgB0qGZK9vZQAe', NULL, '2026-09-03 19:56:31', '2026-09-03 19:56:31');
INSERT INTO `users` (`id`, `name`, `email`, `role`, `phone`, `license_number`, `is_active`, `avatar`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES ('2', 'Lic. Carlos Rossi', 'inspector@seguridad.local', 'inspector', '+54 11 5566-7788', 'LIC-HYS-8492', '1', NULL, NULL, '$2y$12$vTPfu7N/c0RRY.47fgz5FeCkSDaq3QPvsIWWeqgHzNNRuyOgXnmLe', NULL, '2026-09-03 19:56:31', '2026-09-03 19:56:31');
INSERT INTO `users` (`id`, `name`, `email`, `role`, `phone`, `license_number`, `is_active`, `avatar`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES ('3', 'Lic. María Fernández', 'maria@seguridad.local', 'inspector', '+54 11 6677-8899', 'LIC-HYS-3120', '1', NULL, NULL, '$2y$12$uHDeJufR7PD0/q0o8kotbeq/cQQlNOxRj1B/R/72vP0wzqOsU8W7a', NULL, '2026-09-03 19:56:32', '2026-09-03 19:56:32');

-- --------------------------------------------------------
-- Estructura para la tabla `companies`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `companies`;
CREATE TABLE `companies` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `business_name` varchar(255) NOT NULL,
  `tax_id` varchar(50) NOT NULL UNIQUE,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `industry_sector` varchar(100) NOT NULL,
  `employee_count` int(11) NOT NULL DEFAULT 1,
  `website` varchar(255) DEFAULT NULL,
  `contact_person` varchar(255) DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `companies_created_by_foreign` (`created_by`),
  CONSTRAINT `companies_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcado de datos para la tabla `companies`
INSERT INTO `companies` (`id`, `business_name`, `tax_id`, `address`, `phone`, `email`, `industry_sector`, `employee_count`, `website`, `contact_person`, `created_by`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES ('1', 'Siderúrgica del Plata S.A.', '30-71234567-8', 'Av. Industrial 4500, Zárate, Buenos Aires', '+54 11 4899-1000', 'contacto@siderurgicadelplata.com.ar', 'Metalmecánica', '185', 'https://siderurgicadelplata.com.ar', 'Ing. Roberto Gómez (Jefe de Planta)', '1', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32', NULL);
INSERT INTO `companies` (`id`, `business_name`, `tax_id`, `address`, `phone`, `email`, `industry_sector`, `employee_count`, `website`, `contact_person`, `created_by`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES ('2', 'Constructora Horizontes S.R.L.', '30-65432198-4', 'Ruta Panamericana Km 42, Pilar, Buenos Aires', '+54 11 4780-3344', 'info@horizontesobras.com', 'Construcción', '95', 'https://horizontesobras.com', 'Arq. Martín Benítez (Director de Obra)', '2', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32', NULL);
INSERT INTO `companies` (`id`, `business_name`, `tax_id`, `address`, `phone`, `email`, `industry_sector`, `employee_count`, `website`, `contact_person`, `created_by`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES ('3', 'Laboratorios BioQuim S.A.', '30-88997766-2', 'Parque Industrial Burzaco, Lote 14, Buenos Aires', '+54 11 4299-8800', 'hys@bioquimsa.com', 'Química y Farmacéutica', '52', 'https://bioquimsa.com', 'Dra. Silvina Castro (Responsable Calidad)', '1', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32', NULL);
INSERT INTO `companies` (`id`, `business_name`, `tax_id`, `address`, `phone`, `email`, `industry_sector`, `employee_count`, `website`, `contact_person`, `created_by`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES ('4', 'Logística y Distribución Austral', '30-55443322-1', 'Colectora Oeste 1240, Benavídez, Buenos Aires', '+54 11 5032-4411', 'seguridad@logisticaaustral.com', 'Logística y Transporte', '140', 'https://logisticaaustral.com', 'Sr. Claudio Suárez (Gerente de Operaciones)', '3', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32', NULL);

-- --------------------------------------------------------
-- Estructura para la tabla `company_user`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `company_user`;
CREATE TABLE `company_user` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `company_user_unique` (`company_id`,`user_id`),
  KEY `company_user_user_id_foreign` (`user_id`),
  CONSTRAINT `company_user_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `company_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcado de datos para la tabla `company_user`
INSERT INTO `company_user` (`id`, `company_id`, `user_id`, `created_at`, `updated_at`) VALUES ('1', '1', '2', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `company_user` (`id`, `company_id`, `user_id`, `created_at`, `updated_at`) VALUES ('2', '2', '2', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `company_user` (`id`, `company_id`, `user_id`, `created_at`, `updated_at`) VALUES ('3', '2', '3', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `company_user` (`id`, `company_id`, `user_id`, `created_at`, `updated_at`) VALUES ('4', '3', '3', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `company_user` (`id`, `company_id`, `user_id`, `created_at`, `updated_at`) VALUES ('5', '4', '2', '2026-09-03 19:56:32', '2026-09-03 19:56:32');

-- --------------------------------------------------------
-- Estructura para la tabla `checklist_categories`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `checklist_categories`;
CREATE TABLE `checklist_categories` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `icon` varchar(100) NOT NULL DEFAULT 'fa-clipboard-check',
  `description` text DEFAULT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcado de datos para la tabla `checklist_categories`
INSERT INTO `checklist_categories` (`id`, `name`, `icon`, `description`, `order`, `created_at`, `updated_at`) VALUES ('1', 'Herramientas manuales y portátiles', 'fa-tools', 'Inspección del estado de conservación, aislamientos y uso seguro de herramientas.', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_categories` (`id`, `name`, `icon`, `description`, `order`, `created_at`, `updated_at`) VALUES ('2', 'Instalaciones eléctricas', 'fa-bolt', 'Tableros, disyuntores, puestas a tierra y canalizaciones eléctricas.', '2', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_categories` (`id`, `name`, `icon`, `description`, `order`, `created_at`, `updated_at`) VALUES ('3', 'Vehículos y autoelevadores', 'fa-truck-pickup', 'Mantenimiento preventivo, alarmas de retroceso y habilitaciones de conductores.', '3', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_categories` (`id`, `name`, `icon`, `description`, `order`, `created_at`, `updated_at`) VALUES ('4', 'Procedimientos de trabajo seguro (PTS)', 'fa-file-signature', 'Instrucciones escritas, permisos de trabajo de alto riesgo y análisis de tareas.', '4', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_categories` (`id`, `name`, `icon`, `description`, `order`, `created_at`, `updated_at`) VALUES ('5', 'Equipos de Protección Personal (EPP)', 'fa-hard-hat', 'Suministro, uso efectivo, certificación y registro de entrega de EPP.', '5', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_categories` (`id`, `name`, `icon`, `description`, `order`, `created_at`, `updated_at`) VALUES ('6', 'Señalización y cartelería', 'fa-exclamation-triangle', 'Cartelería de advertencia, prohibición, obligación y vías de circulación.', '6', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_categories` (`id`, `name`, `icon`, `description`, `order`, `created_at`, `updated_at`) VALUES ('7', 'Emergencias y evacuación', 'fa-fire-extinguisher', 'Matafuegos, salidas de emergencia, iluminación de emergencia y planos de evacuación.', '7', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_categories` (`id`, `name`, `icon`, `description`, `order`, `created_at`, `updated_at`) VALUES ('8', 'Almacenamiento y estibaje', 'fa-boxes', 'Racks de carga, alturas de estiba, orden y limpieza.', '8', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_categories` (`id`, `name`, `icon`, `description`, `order`, `created_at`, `updated_at`) VALUES ('9', 'Sustancias químicas y residuos peligrosos', 'fa-flask', 'Hojas de datos de seguridad (FDS), contención de derrames y rotulación SGA.', '9', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_categories` (`id`, `name`, `icon`, `description`, `order`, `created_at`, `updated_at`) VALUES ('10', 'Maquinaria y equipos industriales', 'fa-cogs', 'Protecciones fijas y móviles, paradas de emergencia y bloqueo LOTO.', '10', '2026-09-03 19:56:32', '2026-09-03 19:56:32');

-- --------------------------------------------------------
-- Estructura para la tabla `checklist_items`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `checklist_items`;
CREATE TABLE `checklist_items` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(500) NOT NULL,
  `normative_reference` varchar(255) DEFAULT NULL,
  `verification_method` varchar(255) DEFAULT NULL,
  `industry_sector` varchar(100) DEFAULT NULL,
  `inspection_type` varchar(50) DEFAULT NULL,
  `default_risk_level` varchar(20) NOT NULL DEFAULT 'Medio',
  `is_system` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `checklist_items_category_id_foreign` (`category_id`),
  CONSTRAINT `checklist_items_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `checklist_categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcado de datos para la tabla `checklist_items`
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('1', '1', 'Herramientas de mano en buen estado de conservación (sin rebabas, mangos fisurados o astillados)', 'Dec. 351/79 Art. 110 - Dec. 911/96 Art. 182', 'Inspección visual y funcional en pañol y puestos', NULL, NULL, 'Medio', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('2', '1', 'Herramientas eléctricas portátiles con doble aislamiento o puesta a tierra y cables sin empalmes precarios', 'Dec. 351/79 Anexo VI Art. 3.1.2', 'Verificación física de cables, enchufes y carcasas', NULL, NULL, 'Alto', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('3', '1', 'Dispositivos de protección en amoladoras (guarda protectora, bridas y llave de ajuste)', 'Dec. 351/79 Art. 113', 'Inspección visual directa de la guarda y disco', NULL, NULL, 'Alto', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('4', '2', 'Tableros eléctricos cerrados con contratapa, llave y debidamente identificados con señal de riesgo eléctrico', 'Dec. 351/79 Anexo VI Art. 3', 'Inspección visual de tableros seccionales y principales', NULL, NULL, 'Alto', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('5', '2', 'Presencia y funcionamiento de interruptores termomagnéticos y disyuntores diferenciales', 'Norma IRAM 2071 - Dec. 351/79 Anexo VI', 'Prueba de botón de test y registro de mediciones', NULL, NULL, 'Alto', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('6', '2', 'Protocolo y medición periódica de puesta a tierra y continuidad de masas vigente (SRT 900/15)', 'Resolución SRT 900/15', 'Verificación documental de protocolo firmado por profesional con matrícula', NULL, NULL, 'Medio', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('7', '3', 'Autoelevadores equipados con alarma sonora de retroceso, destellador luminoso y cinturón de seguridad inercial', 'Resolución SRT 960/15 Art. 3', 'Prueba funcional en marcha', NULL, NULL, 'Alto', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('8', '3', 'Operadores de autoelevadores y maquinaria pesada con credencial habilitante vigente (SRT 960/15)', 'Resolución SRT 960/15 Art. 10', 'Control de legajos y credenciales de conductores', NULL, NULL, 'Medio', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('9', '3', 'Registro diario de checklist pre-operacional por parte del conductor antes del inicio del turno', 'Resolución SRT 960/15 Anexo I', 'Auditoría de planillas de chequeo diario', NULL, NULL, 'Bajo', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('10', '4', 'Existencia de Procedimientos de Trabajo Seguro (PTS) documentados y comunicados para tareas críticas', 'Ley 19.587 Art. 9 - Dec. 351/79 Art. 208', 'Revisión de carpetas de procedimientos y entrevistas a operarios', NULL, NULL, 'Medio', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('11', '4', 'Sistema de Permisos de Trabajo Seguro (PT) para trabajos en caliente, espacios confinados y altura', 'Dec. 911/96 Art. 54 y 55', 'Constatación de permisos firmados en el puesto de trabajo', NULL, NULL, 'Alto', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('12', '5', 'Uso obligatorio y adecuado de EPP básicos (casco con barbijo, calzado de seguridad con puntera, protección ocular)', 'Dec. 351/79 Cap. 19 Art. 188 - 194', 'Observación directa de operarios en planta', NULL, NULL, 'Alto', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('13', '5', 'EPP certificados con sello IRAM o marca de conformidad correspondiente', 'Resolución SRT 896/99', 'Inspección de etiquetas y certificados de calidad de insumos', NULL, NULL, 'Medio', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('14', '5', 'Planilla oficial de entrega de EPP firmada por los trabajadores (Resolución SRT 299/11)', 'Resolución SRT 299/11', 'Auditoría de constancias de entrega archivadas', NULL, NULL, 'Medio', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('15', '6', 'Demarcación de sendas peatonales y vías de circulación vehicular en pisos de naves y depósitos', 'Norma IRAM 10005 - Dec. 351/79 Cap. 12', 'Inspección visual de líneas perimetrales amarillas/blancas', NULL, NULL, 'Medio', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('16', '6', 'Cartelería de advertencia de riesgos y obligatoriedad de uso de EPP visible en los accesos', 'Norma IRAM 10005 Parte I y II', 'Recorrido visual en accesos y puestos clave', NULL, NULL, 'Bajo', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('17', '7', 'Extintores con carga vigente, tarjeta de mantenimiento IRAM 3517-2, manómetro en rango verde y acceso despejado', 'Norma IRAM 3517-2 - Dec. 351/79 Cap. 18 Art. 176', 'Revisión visual de tarjetas, manómetros y libre acceso a cada extintor', NULL, NULL, 'Alto', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('18', '7', 'Salidas y vías de evacuación señalizadas, libres de obstáculos y con apertura hacia afuera sin llave', 'Dec. 351/79 Art. 172', 'Recorrido de trayectorias de escape y prueba de puertas antipánico', NULL, NULL, 'Alto', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('19', '7', 'Luces de emergencia autónomas operativas en pasillos, salidas y sectores sin luz natural', 'Dec. 351/79 Art. 78', 'Corte selectivo o pulsador de prueba de luminarias', NULL, NULL, 'Medio', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('20', '8', 'Racks y estanterías con indicación de carga máxima admisible y sin deformaciones estructurales', 'Dec. 351/79 Art. 42 - 45', 'Inspección de carteles de carga y verticalidad de largueros', NULL, NULL, 'Alto', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('21', '8', 'Estiba de mercaderías trabada, respetando pasillos de tránsito y distancias a rociadores/luminarias', 'Dec. 351/79 Art. 43', 'Inspección ocular en depósitos', NULL, NULL, 'Medio', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('22', '9', 'Productos químicos rotulados según Sistema Globalmente Armonizado (SGA / GHS) con pictogramas de peligro', 'Resolución SRT 801/15', 'Inspección de envases en uso y almacenamiento', NULL, NULL, 'Alto', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('23', '9', 'Fichas de Datos de Seguridad (FDS / MSDS en español) disponibles y accesibles para los trabajadores', 'Resolución SRT 801/15 Art. 3', 'Constatación de carpetas de FDS en el sector de manipulación', NULL, NULL, 'Medio', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('24', '9', 'Bandejas o cubas de retención secundaria para prevención de derrames de líquidos peligrosos', 'Ley 24.051 Art. 33 - Dec. 351/79 Art. 145', 'Inspección de capacidades de bateas y kits antiderrame', NULL, NULL, 'Alto', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('25', '10', 'Órganos móviles de transmisión (correas, engranajes, poleas) resguardados con protecciones fijas seguras', 'Dec. 351/79 Cap. 15 Art. 103 - 109', 'Inspección visual de cercas y enrejados en máquinas', NULL, NULL, 'Alto', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `checklist_items` (`id`, `category_id`, `title`, `normative_reference`, `verification_method`, `industry_sector`, `inspection_type`, `default_risk_level`, `is_system`, `created_at`, `updated_at`) VALUES ('26', '10', 'Pulsadores de parada de emergencia tipo golpe de puño (seta) funcionales y accesibles en puestos de mando', 'Dec. 351/79 Art. 108', 'Prueba funcional coordinada de paradas de emergencia', NULL, NULL, 'Alto', '1', '2026-09-03 19:56:32', '2026-09-03 19:56:32');

-- --------------------------------------------------------
-- Estructura para la tabla `inspections`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `inspections`;
CREATE TABLE `inspections` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `company_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `inspection_date` date NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'General',
  `status` varchar(50) NOT NULL DEFAULT 'Borrador',
  `start_time` varchar(20) DEFAULT NULL,
  `end_time` varchar(20) DEFAULT NULL,
  `general_observations` text DEFAULT NULL,
  `progress_percentage` int(11) NOT NULL DEFAULT 0,
  `signature_inspector` text DEFAULT NULL,
  `signature_company` text DEFAULT NULL,
  `signature_company_name` varchar(255) DEFAULT NULL,
  `token` varchar(255) NOT NULL UNIQUE,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inspections_company_id_foreign` (`company_id`),
  KEY `inspections_user_id_foreign` (`user_id`),
  CONSTRAINT `inspections_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `inspections_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcado de datos para la tabla `inspections`
INSERT INTO `inspections` (`id`, `company_id`, `user_id`, `inspection_date`, `type`, `status`, `start_time`, `end_time`, `general_observations`, `progress_percentage`, `signature_inspector`, `signature_company`, `signature_company_name`, `token`, `created_at`, `updated_at`, `deleted_at`) VALUES ('1', '1', '2', '2026-08-29 19:56:32', 'General', 'Completada', '09:00', '13:30', 'Auditoría integral semestral de condiciones de higiene y seguridad laboral. Se recorrió nave de conformado, pañol y sector de expedición.', '100', 'Lic. Carlos Rossi - Mat. 8492', 'Ing. Roberto Gómez', 'Roberto Gómez - Jefe de Planta', 'ebdd79e8-d9cb-4f82-8b2c-a18e68b227b4', '2026-09-03 19:56:32', '2026-09-03 19:56:32', NULL);
INSERT INTO `inspections` (`id`, `company_id`, `user_id`, `inspection_date`, `type`, `status`, `start_time`, `end_time`, `general_observations`, `progress_percentage`, `signature_inspector`, `signature_company`, `signature_company_name`, `token`, `created_at`, `updated_at`, `deleted_at`) VALUES ('2', '2', '2', '2026-09-03 19:56:32', 'Específica', 'En Progreso', '10:30', NULL, 'Inspección técnica enfocada en trabajos en altura y uso de andamios en obra modular.', '36', NULL, NULL, NULL, '2dd42b39-1e3a-4615-8896-56449f1ad2dc', '2026-09-03 19:56:32', '2026-09-03 19:56:32', NULL);

-- --------------------------------------------------------
-- Estructura para la tabla `inspection_checklist_items`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `inspection_checklist_items`;
CREATE TABLE `inspection_checklist_items` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `inspection_id` bigint(20) UNSIGNED NOT NULL,
  `checklist_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `category_name` varchar(255) NOT NULL,
  `title` varchar(500) NOT NULL,
  `normative_reference` varchar(255) DEFAULT NULL,
  `verification_method` varchar(255) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pendiente',
  `risk_level` varchar(20) NOT NULL DEFAULT 'Bajo',
  `notes` text DEFAULT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `is_custom` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `inspection_checklist_items_inspection_id_foreign` (`inspection_id`),
  CONSTRAINT `inspection_checklist_items_inspection_id_foreign` FOREIGN KEY (`inspection_id`) REFERENCES `inspections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcado de datos para la tabla `inspection_checklist_items`
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('1', '1', '1', 'Herramientas manuales y portátiles', 'Herramientas de mano en buen estado de conservación (sin rebabas, mangos fisurados o astillados)', 'Dec. 351/79 Art. 110 - Dec. 911/96 Art. 182', 'Inspección visual y funcional en pañol y puestos', 'Cumple', 'Medio', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('2', '1', '2', 'Herramientas manuales y portátiles', 'Herramientas eléctricas portátiles con doble aislamiento o puesta a tierra y cables sin empalmes precarios', 'Dec. 351/79 Anexo VI Art. 3.1.2', 'Verificación física de cables, enchufes y carcasas', 'Cumple', 'Alto', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('3', '1', '3', 'Herramientas manuales y portátiles', 'Dispositivos de protección en amoladoras (guarda protectora, bridas y llave de ajuste)', 'Dec. 351/79 Art. 113', 'Inspección visual directa de la guarda y disco', 'Cumple', 'Alto', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('4', '1', '4', 'Instalaciones eléctricas', 'Tableros eléctricos cerrados con contratapa, llave y debidamente identificados con señal de riesgo eléctrico', 'Dec. 351/79 Anexo VI Art. 3', 'Inspección visual de tableros seccionales y principales', 'No Cumple', 'Alto', 'Tablero secundario TS-03 sin cerradura y con cables de alimentación expuestos.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('5', '1', '5', 'Instalaciones eléctricas', 'Presencia y funcionamiento de interruptores termomagnéticos y disyuntores diferenciales', 'Norma IRAM 2071 - Dec. 351/79 Anexo VI', 'Prueba de botón de test y registro de mediciones', 'Cumple', 'Alto', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('6', '1', '6', 'Instalaciones eléctricas', 'Protocolo y medición periódica de puesta a tierra y continuidad de masas vigente (SRT 900/15)', 'Resolución SRT 900/15', 'Verificación documental de protocolo firmado por profesional con matrícula', 'Cumple', 'Medio', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('7', '1', '7', 'Vehículos y autoelevadores', 'Autoelevadores equipados con alarma sonora de retroceso, destellador luminoso y cinturón de seguridad inercial', 'Resolución SRT 960/15 Art. 3', 'Prueba funcional en marcha', 'Cumple', 'Alto', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('8', '1', '8', 'Vehículos y autoelevadores', 'Operadores de autoelevadores y maquinaria pesada con credencial habilitante vigente (SRT 960/15)', 'Resolución SRT 960/15 Art. 10', 'Control de legajos y credenciales de conductores', 'Cumple', 'Medio', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('9', '1', '9', 'Vehículos y autoelevadores', 'Registro diario de checklist pre-operacional por parte del conductor antes del inicio del turno', 'Resolución SRT 960/15 Anexo I', 'Auditoría de planillas de chequeo diario', 'No Aplica', 'Bajo', 'El turno inspeccionado opera únicamente con transpaletas manuales.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('10', '1', '10', 'Procedimientos de trabajo seguro (PTS)', 'Existencia de Procedimientos de Trabajo Seguro (PTS) documentados y comunicados para tareas críticas', 'Ley 19.587 Art. 9 - Dec. 351/79 Art. 208', 'Revisión de carpetas de procedimientos y entrevistas a operarios', 'Cumple', 'Medio', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('11', '1', '11', 'Procedimientos de trabajo seguro (PTS)', 'Sistema de Permisos de Trabajo Seguro (PT) para trabajos en caliente, espacios confinados y altura', 'Dec. 911/96 Art. 54 y 55', 'Constatación de permisos firmados en el puesto de trabajo', 'Cumple', 'Alto', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('12', '1', '12', 'Equipos de Protección Personal (EPP)', 'Uso obligatorio y adecuado de EPP básicos (casco con barbijo, calzado de seguridad con puntera, protección ocular)', 'Dec. 351/79 Cap. 19 Art. 188 - 194', 'Observación directa de operarios en planta', 'Cumple', 'Alto', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('13', '1', '13', 'Equipos de Protección Personal (EPP)', 'EPP certificados con sello IRAM o marca de conformidad correspondiente', 'Resolución SRT 896/99', 'Inspección de etiquetas y certificados de calidad de insumos', 'Cumple', 'Medio', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('14', '1', '14', 'Equipos de Protección Personal (EPP)', 'Planilla oficial de entrega de EPP firmada por los trabajadores (Resolución SRT 299/11)', 'Resolución SRT 299/11', 'Auditoría de constancias de entrega archivadas', 'Cumple', 'Medio', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('15', '1', '15', 'Señalización y cartelería', 'Demarcación de sendas peatonales y vías de circulación vehicular en pisos de naves y depósitos', 'Norma IRAM 10005 - Dec. 351/79 Cap. 12', 'Inspección visual de líneas perimetrales amarillas/blancas', 'Cumple', 'Medio', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('16', '1', '16', 'Señalización y cartelería', 'Cartelería de advertencia de riesgos y obligatoriedad de uso de EPP visible en los accesos', 'Norma IRAM 10005 Parte I y II', 'Recorrido visual en accesos y puestos clave', 'Cumple', 'Bajo', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('17', '1', '17', 'Emergencias y evacuación', 'Extintores con carga vigente, tarjeta de mantenimiento IRAM 3517-2, manómetro en rango verde y acceso despejado', 'Norma IRAM 3517-2 - Dec. 351/79 Cap. 18 Art. 176', 'Revisión visual de tarjetas, manómetros y libre acceso a cada extintor', 'No Cumple', 'Alto', 'Extintor nº 14 tipo ABC con tarjeta vencida hace 30 días y obstruido por pallets.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('18', '1', '18', 'Emergencias y evacuación', 'Salidas y vías de evacuación señalizadas, libres de obstáculos y con apertura hacia afuera sin llave', 'Dec. 351/79 Art. 172', 'Recorrido de trayectorias de escape y prueba de puertas antipánico', 'Cumple', 'Alto', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('19', '1', '19', 'Emergencias y evacuación', 'Luces de emergencia autónomas operativas en pasillos, salidas y sectores sin luz natural', 'Dec. 351/79 Art. 78', 'Corte selectivo o pulsador de prueba de luminarias', 'Cumple', 'Medio', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('20', '1', '20', 'Almacenamiento y estibaje', 'Racks y estanterías con indicación de carga máxima admisible y sin deformaciones estructurales', 'Dec. 351/79 Art. 42 - 45', 'Inspección de carteles de carga y verticalidad de largueros', 'Cumple', 'Alto', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('21', '1', '21', 'Almacenamiento y estibaje', 'Estiba de mercaderías trabada, respetando pasillos de tránsito y distancias a rociadores/luminarias', 'Dec. 351/79 Art. 43', 'Inspección ocular en depósitos', 'Cumple', 'Medio', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('22', '1', '22', 'Sustancias químicas y residuos peligrosos', 'Productos químicos rotulados según Sistema Globalmente Armonizado (SGA / GHS) con pictogramas de peligro', 'Resolución SRT 801/15', 'Inspección de envases en uso y almacenamiento', 'Cumple', 'Alto', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('23', '1', '23', 'Sustancias químicas y residuos peligrosos', 'Fichas de Datos de Seguridad (FDS / MSDS en español) disponibles y accesibles para los trabajadores', 'Resolución SRT 801/15 Art. 3', 'Constatación de carpetas de FDS en el sector de manipulación', 'Cumple', 'Medio', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('24', '1', '24', 'Sustancias químicas y residuos peligrosos', 'Bandejas o cubas de retención secundaria para prevención de derrames de líquidos peligrosos', 'Ley 24.051 Art. 33 - Dec. 351/79 Art. 145', 'Inspección de capacidades de bateas y kits antiderrame', 'Cumple', 'Alto', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('25', '1', '25', 'Maquinaria y equipos industriales', 'Órganos móviles de transmisión (correas, engranajes, poleas) resguardados con protecciones fijas seguras', 'Dec. 351/79 Cap. 15 Art. 103 - 109', 'Inspección visual de cercas y enrejados en máquinas', 'Cumple', 'Alto', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('26', '1', '26', 'Maquinaria y equipos industriales', 'Pulsadores de parada de emergencia tipo golpe de puño (seta) funcionales y accesibles en puestos de mando', 'Dec. 351/79 Art. 108', 'Prueba funcional coordinada de paradas de emergencia', 'Cumple', 'Alto', 'Condición satisfactoria verificado según protocolo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('27', '2', '1', 'Herramientas manuales y portátiles', 'Herramientas de mano en buen estado de conservación (sin rebabas, mangos fisurados o astillados)', 'Dec. 351/79 Art. 110 - Dec. 911/96 Art. 182', 'Inspección visual y funcional en pañol y puestos', 'Cumple', 'Medio', 'Verificado en campo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('28', '2', '2', 'Herramientas manuales y portátiles', 'Herramientas eléctricas portátiles con doble aislamiento o puesta a tierra y cables sin empalmes precarios', 'Dec. 351/79 Anexo VI Art. 3.1.2', 'Verificación física de cables, enchufes y carcasas', 'Pendiente', 'Alto', NULL, NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('29', '2', '3', 'Herramientas manuales y portátiles', 'Dispositivos de protección en amoladoras (guarda protectora, bridas y llave de ajuste)', 'Dec. 351/79 Art. 113', 'Inspección visual directa de la guarda y disco', 'Pendiente', 'Alto', NULL, NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('30', '2', '4', 'Instalaciones eléctricas', 'Tableros eléctricos cerrados con contratapa, llave y debidamente identificados con señal de riesgo eléctrico', 'Dec. 351/79 Anexo VI Art. 3', 'Inspección visual de tableros seccionales y principales', 'Cumple', 'Alto', 'Verificado en campo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('31', '2', '5', 'Instalaciones eléctricas', 'Presencia y funcionamiento de interruptores termomagnéticos y disyuntores diferenciales', 'Norma IRAM 2071 - Dec. 351/79 Anexo VI', 'Prueba de botón de test y registro de mediciones', 'Pendiente', 'Alto', NULL, NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('32', '2', '6', 'Instalaciones eléctricas', 'Protocolo y medición periódica de puesta a tierra y continuidad de masas vigente (SRT 900/15)', 'Resolución SRT 900/15', 'Verificación documental de protocolo firmado por profesional con matrícula', 'Pendiente', 'Medio', NULL, NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('33', '2', '7', 'Vehículos y autoelevadores', 'Autoelevadores equipados con alarma sonora de retroceso, destellador luminoso y cinturón de seguridad inercial', 'Resolución SRT 960/15 Art. 3', 'Prueba funcional en marcha', 'Cumple', 'Alto', 'Verificado en campo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('34', '2', '8', 'Vehículos y autoelevadores', 'Operadores de autoelevadores y maquinaria pesada con credencial habilitante vigente (SRT 960/15)', 'Resolución SRT 960/15 Art. 10', 'Control de legajos y credenciales de conductores', 'Pendiente', 'Medio', NULL, NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('35', '2', '9', 'Vehículos y autoelevadores', 'Registro diario de checklist pre-operacional por parte del conductor antes del inicio del turno', 'Resolución SRT 960/15 Anexo I', 'Auditoría de planillas de chequeo diario', 'Pendiente', 'Bajo', NULL, NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('36', '2', '10', 'Procedimientos de trabajo seguro (PTS)', 'Existencia de Procedimientos de Trabajo Seguro (PTS) documentados y comunicados para tareas críticas', 'Ley 19.587 Art. 9 - Dec. 351/79 Art. 208', 'Revisión de carpetas de procedimientos y entrevistas a operarios', 'Cumple', 'Medio', 'Verificado en campo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('37', '2', '11', 'Procedimientos de trabajo seguro (PTS)', 'Sistema de Permisos de Trabajo Seguro (PT) para trabajos en caliente, espacios confinados y altura', 'Dec. 911/96 Art. 54 y 55', 'Constatación de permisos firmados en el puesto de trabajo', 'Pendiente', 'Alto', NULL, NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('38', '2', '12', 'Equipos de Protección Personal (EPP)', 'Uso obligatorio y adecuado de EPP básicos (casco con barbijo, calzado de seguridad con puntera, protección ocular)', 'Dec. 351/79 Cap. 19 Art. 188 - 194', 'Observación directa de operarios en planta', 'Cumple', 'Alto', 'Verificado en campo.', NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('39', '2', '13', 'Equipos de Protección Personal (EPP)', 'EPP certificados con sello IRAM o marca de conformidad correspondiente', 'Resolución SRT 896/99', 'Inspección de etiquetas y certificados de calidad de insumos', 'Pendiente', 'Medio', NULL, NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `inspection_checklist_items` (`id`, `inspection_id`, `checklist_item_id`, `category_name`, `title`, `normative_reference`, `verification_method`, `status`, `risk_level`, `notes`, `photos`, `is_custom`, `created_at`, `updated_at`) VALUES ('40', '2', '14', 'Equipos de Protección Personal (EPP)', 'Planilla oficial de entrega de EPP firmada por los trabajadores (Resolución SRT 299/11)', 'Resolución SRT 299/11', 'Auditoría de constancias de entrega archivadas', 'Pendiente', 'Medio', NULL, NULL, '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');

-- --------------------------------------------------------
-- Estructura para la tabla `observations`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `observations`;
CREATE TABLE `observations` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `inspection_id` bigint(20) UNSIGNED NOT NULL,
  `inspection_checklist_item_id` bigint(20) UNSIGNED DEFAULT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'Hallazgo',
  `severity` varchar(50) NOT NULL DEFAULT 'Moderado',
  `location` varchar(255) DEFAULT NULL,
  `description` text NOT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `observations_inspection_id_foreign` (`inspection_id`),
  CONSTRAINT `observations_inspection_id_foreign` FOREIGN KEY (`inspection_id`) REFERENCES `inspections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcado de datos para la tabla `observations`
INSERT INTO `observations` (`id`, `inspection_id`, `inspection_checklist_item_id`, `type`, `severity`, `location`, `description`, `photos`, `created_at`, `updated_at`) VALUES ('1', '1', '4', 'Hallazgo', 'Mayor', 'Nave 2 - Sector Taller de Mecanizado', 'El tablero seccional eléctrico TS-03 no cuenta con tapa cubrebornes de acrílico ni traba de seguridad en la puerta, existiendo riesgo inminente de contacto eléctrico directo accidental.', NULL, '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `observations` (`id`, `inspection_id`, `inspection_checklist_item_id`, `type`, `severity`, `location`, `description`, `photos`, `created_at`, `updated_at`) VALUES ('2', '1', '17', 'Hallazgo', 'Crítico', 'Depósito de Insumos - Portón Este', 'Matafuegos con carga expirada y tapado por mercadería en pallets, impidiendo el rápido accionamiento en caso de foco de incendio.', NULL, '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `observations` (`id`, `inspection_id`, `inspection_checklist_item_id`, `type`, `severity`, `location`, `description`, `photos`, `created_at`, `updated_at`) VALUES ('3', '1', NULL, 'Buena práctica', 'Menor', 'Línea de Ensamble Final', 'Excelente señalización horizontal y uso consistente de cascos y protectores auditivos de copa por todo el personal de línea.', NULL, '2026-09-03 19:56:32', '2026-09-03 19:56:32');

-- --------------------------------------------------------
-- Estructura para la tabla `corrective_measures`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `corrective_measures`;
CREATE TABLE `corrective_measures` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `inspection_id` bigint(20) UNSIGNED NOT NULL,
  `observation_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` text NOT NULL,
  `priority` varchar(50) NOT NULL DEFAULT 'Media',
  `recommendations` text DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `responsible_person` varchar(255) DEFAULT NULL,
  `estimated_cost` decimal(12,2) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pendiente',
  `verification_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `corrective_measures_inspection_id_foreign` (`inspection_id`),
  CONSTRAINT `corrective_measures_inspection_id_foreign` FOREIGN KEY (`inspection_id`) REFERENCES `inspections` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcado de datos para la tabla `corrective_measures`
INSERT INTO `corrective_measures` (`id`, `inspection_id`, `observation_id`, `description`, `priority`, `recommendations`, `deadline`, `responsible_person`, `estimated_cost`, `status`, `verification_date`, `notes`, `created_at`, `updated_at`) VALUES ('1', '1', '1', 'Instalar contratapa aislante acrílica reglamentaria, colocar cerradura de seguridad y señalizar tablero TS-03 con advertencia de riesgo eléctrico.', 'Alta', 'Contratar electricista matriculado para el reemplazo inmediato de la protección de bornes.', '2026-09-10 19:56:32', 'Ing. Roberto Gómez / Dpto. Mantenimiento', '150000', 'En Progreso', NULL, 'Materiales solicitados al proveedor.', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `corrective_measures` (`id`, `inspection_id`, `observation_id`, `description`, `priority`, `recommendations`, `deadline`, `responsible_person`, `estimated_cost`, `status`, `verification_date`, `notes`, `created_at`, `updated_at`) VALUES ('2', '1', '2', 'Realizar recarga y prueba hidráulica inmediata del extintor nº 14 y demarcar en el piso la zona de seguridad libre de obstáculos (1 m²).', 'Crítica', 'Reemplazar provisoriamente con extintor de reserva del pañol y despejar pasillo.', '2026-09-05 19:56:32', 'Sr. Jorge Valenzuela (Seguridad Patrimonial)', '45000', 'Pendiente', NULL, 'Urgente para cumplir Dec. 351/79 Art. 176.', '2026-09-03 19:56:32', '2026-09-03 19:56:32');

-- --------------------------------------------------------
-- Estructura para la tabla `app_notifications`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `app_notifications`;
CREATE TABLE `app_notifications` (
  `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'info',
  `link` varchar(255) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `app_notifications_user_id_foreign` (`user_id`),
  CONSTRAINT `app_notifications_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcado de datos para la tabla `app_notifications`
INSERT INTO `app_notifications` (`id`, `user_id`, `title`, `message`, `type`, `link`, `is_read`, `created_at`, `updated_at`) VALUES ('1', '2', 'Medida correctiva de alta urgencia', 'La medida correctiva para el extintor de Siderúrgica del Plata tiene vencimiento en 2 días.', 'danger', '/inspections/1', '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');
INSERT INTO `app_notifications` (`id`, `user_id`, `title`, `message`, `type`, `link`, `is_read`, `created_at`, `updated_at`) VALUES ('2', '1', 'Nueva empresa registrada', 'El Lic. Carlos Rossi registró la empresa \"Constructora Horizontes S.R.L.\"', 'info', '/companies/2', '0', '2026-09-03 19:56:32', '2026-09-03 19:56:32');

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
