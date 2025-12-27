-- =============================================
-- CVMATCH AI - SCHEMA BASE DE DONNÉES
-- À exécuter dans Supabase SQL Editor
-- =============================================

-- =============================================
-- TABLE: users
-- Utilisateurs de la plateforme
-- =============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  whatsapp VARCHAR(50),
  user_id VARCHAR(100) UNIQUE NOT NULL, -- ex: "gilles-gozlan"
  github_rag_path VARCHAR(500), -- ex: "gilles-gozlan/"
  onboarding_completed BOOLEAN DEFAULT false,
  completeness_score INTEGER DEFAULT 0,
  subscription_tier VARCHAR(20) DEFAULT 'free', -- 'free', 'pro', 'team'
  subscription_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_user_id ON users(user_id);

-- =============================================
-- TABLE: rag_metadata
-- Métadonnées du profil RAG (le RAG lui-même est sur GitHub)
-- =============================================
CREATE TABLE rag_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  completeness_score INTEGER,
  completeness_details JSONB, -- breakdown par section
  top_10_jobs JSONB, -- top 10 postes suggérés
  rag_version INTEGER DEFAULT 1,
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rag_user_id ON rag_metadata(user_id);

-- =============================================
-- TABLE: job_analyses
-- Analyses de match entre profil et offres d'emploi
-- =============================================
CREATE TABLE job_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Informations sur l'offre
  job_url TEXT,
  job_title VARCHAR(500),
  company VARCHAR(255),
  location VARCHAR(255),
  salary_range VARCHAR(100),
  job_description TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  
  -- Résultats de l'analyse de match
  match_score INTEGER, -- 0-100
  match_level VARCHAR(50), -- 'Excellent', 'Très bon', 'Bon', 'Moyen', 'Faible'
  match_report JSONB, -- rapport complet détaillé
  strengths JSONB, -- array des forces
  gaps JSONB, -- array des faiblesses
  recommendations JSONB, -- array des recommandations
  category_scores JSONB, -- scores par catégorie
  missing_keywords JSONB, -- mots-clés manquants
  
  -- Actions utilisateur
  decision VARCHAR(20) DEFAULT 'pending', -- 'pending', 'generated', 'skipped'
  cv_generated BOOLEAN DEFAULT false,
  cv_template VARCHAR(50),
  cv_url TEXT,
  cv_generated_at TIMESTAMP,
  
  lm_generated BOOLEAN DEFAULT false,
  lm_url TEXT,
  lm_generated_at TIMESTAMP,
  
  -- Suivi candidature
  applied BOOLEAN DEFAULT false,
  applied_at TIMESTAMP,
  application_status VARCHAR(50), -- 'pending', 'interviewing', 'rejected', 'accepted'
  interview_date TIMESTAMP,
  
  -- Notes et organisation
  notes TEXT,
  tags TEXT[], -- ex: ['finance', 'remote', 'priority']
  
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_job_analyses_user_id ON job_analyses(user_id);
CREATE INDEX idx_job_analyses_submitted_at ON job_analyses(submitted_at DESC);
CREATE INDEX idx_job_analyses_match_score ON job_analyses(match_score DESC);

-- =============================================
-- TABLE: cv_generations
-- Historique des CVs générés
-- =============================================
CREATE TABLE cv_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_analysis_id UUID REFERENCES job_analyses(id) ON DELETE CASCADE,
  template_name VARCHAR(50),
  cv_url TEXT,
  cv_data JSONB, -- données JSON utilisées pour générer le CV
  optimizations_applied JSONB, -- liste des optimisations appliquées
  ats_score INTEGER, -- score ATS estimé
  generation_duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cv_generations_user_id ON cv_generations(user_id);
CREATE INDEX idx_cv_generations_job_analysis_id ON cv_generations(job_analysis_id);

-- =============================================
-- TABLE: lm_generations
-- Historique des lettres de motivation générées
-- =============================================
CREATE TABLE lm_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  job_analysis_id UUID REFERENCES job_analyses(id) ON DELETE CASCADE,
  content TEXT, -- contenu de la lettre
  tone VARCHAR(50), -- 'formal', 'professional_warm', 'casual'
  word_count INTEGER,
  pdf_url TEXT,
  docx_url TEXT,
  generation_duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_lm_generations_user_id ON lm_generations(user_id);

-- =============================================
-- TABLE: uploaded_documents
-- Documents uploadés par l'utilisateur
-- =============================================
CREATE TABLE uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(50), -- 'pdf', 'docx', 'json', 'txt'
  file_size INTEGER,
  storage_path TEXT, -- chemin dans Supabase Storage
  extracted_text TEXT, -- texte extrait
  extraction_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  extraction_error TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_uploaded_documents_user_id ON uploaded_documents(user_id);

-- =============================================
-- TABLE: analytics_events
-- Événements pour analytics
-- =============================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(100), -- 'rag_created', 'job_analyzed', 'cv_generated', etc
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);