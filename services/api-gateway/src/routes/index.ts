import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { serviceConfig } from '../config/services';
import { authenticate, authorize } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

/**
 * Auth Service Routes - Public (no authentication required)
 */
router.use(
  '/auth',
  authLimiter,
  createProxyMiddleware({
    target: serviceConfig.auth.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/api/auth',
    },
    onProxyReq: (proxyReq, req: any) => {
      // Forward user data if authenticated
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
        proxyReq.setHeader('X-User-Email', req.user.email);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

/**
 * User Service Routes - Requires authentication
 */
router.use(
  '/users',
  authenticate,
  createProxyMiddleware({
    target: serviceConfig.user.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/users': '/users',
    },
    onProxyReq: (proxyReq, req: any) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
        proxyReq.setHeader('X-User-Email', req.user.email);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

/**
 * Course Service Routes - Requires authentication
 */
router.use(
  '/courses',
  authenticate,
  createProxyMiddleware({
    target: serviceConfig.course.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/courses': '/courses',
    },
    onProxyReq: (proxyReq, req: any) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
        proxyReq.setHeader('X-User-Email', req.user.email);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

/**
 * Attendance Service Routes - Requires authentication
 */
router.use(
  '/attendance',
  authenticate,
  createProxyMiddleware({
    target: serviceConfig.attendance.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/attendance': '/attendance',
    },
    onProxyReq: (proxyReq, req: any) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
        proxyReq.setHeader('X-User-Email', req.user.email);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

/**
 * Grade Service Routes - Requires authentication
 */
router.use(
  '/grades',
  authenticate,
  createProxyMiddleware({
    target: serviceConfig.grade.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/grades': '/grades',
    },
    onProxyReq: (proxyReq, req: any) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
        proxyReq.setHeader('X-User-Email', req.user.email);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

/**
 * Content Service Routes (Announcements, Chat, Exercises) - Requires authentication
 */
router.use(
  '/announcements',
  authenticate,
  createProxyMiddleware({
    target: serviceConfig.content.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/announcements': '/announcements',
    },
    onProxyReq: (proxyReq, req: any) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
        proxyReq.setHeader('X-User-Email', req.user.email);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

router.use(
  '/chat',
  authenticate,
  createProxyMiddleware({
    target: serviceConfig.content.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/chat': '/chat',
    },
    onProxyReq: (proxyReq, req: any) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
        proxyReq.setHeader('X-User-Email', req.user.email);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

router.use(
  '/exercises',
  authenticate,
  createProxyMiddleware({
    target: serviceConfig.content.url,
    changeOrigin: true,
    pathRewrite: {
      '^/api/exercises': '/exercises',
    },
    onProxyReq: (proxyReq, req: any) => {
      if (req.user) {
        proxyReq.setHeader('X-User-Id', req.user.userId);
        proxyReq.setHeader('X-User-Email', req.user.email);
        proxyReq.setHeader('X-User-Role', req.user.role);
      }
    },
  })
);

export default router;
