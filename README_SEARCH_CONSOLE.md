# Google Search Console Keyword Rankings Module

## Structure
- Backend service: `services/searchConsoleService.ts`
- API routes: `routes/searchConsoleRoutes.js`
- React context: `context/SearchConsoleContext.tsx`
- Components: `components/SearchConsole/`

## Features
- OAuth2 connect to Google Search Console
- Scheduled and manual keyword data fetch
- Dashboard for keyword trends and tables
- Export to CSV/PDF

## Next Steps
- Implement OAuth2 logic in backend and ConnectButton
- Implement data fetch and storage
- Build out UI for trends and tables
- Integrate with navigation and permissions
