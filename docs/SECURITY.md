# Security & Governance Policy

## Overview
This document outlines the security architecture, data validation rules, and vulnerability reporting procedures for Budget Allocator.

## Architectural Security
- **Authentication**: JWT token-based authentication with Supabase RBAC.
- **Data Protection**: AES-256 encryption at rest and TLS 1.3 in transit.
- **Client-Side Sanitization**: Strict input validation using Zod and DOMPurify for financial transactions.
- **Least Privilege**: Row Level Security (RLS) policies enforced on all Supabase tables.

## Incident Response
Security reports can be submitted directly via GitHub Security Advisories or to the maintainer at x.bhavish.s@gmail.com.
