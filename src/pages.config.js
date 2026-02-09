/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Dashboard from './pages/Dashboard';
import Modules from './pages/Modules';
import ModuleDetail from './pages/ModuleDetail';
import QuizPage from './pages/QuizPage';
import CaseStudies from './pages/CaseStudies';
import CaseStudyDetail from './pages/CaseStudyDetail';
import SkillsChecklists from './pages/SkillsChecklists';
import ChecklistDetail from './pages/ChecklistDetail';
import ResourceLibrary from './pages/ResourceLibrary';
import Discussions from './pages/Discussions';
import Progress from './pages/Progress';
import Certificates from './pages/Certificates';
import AdminPanel from './pages/AdminPanel';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Modules": Modules,
    "ModuleDetail": ModuleDetail,
    "QuizPage": QuizPage,
    "CaseStudies": CaseStudies,
    "CaseStudyDetail": CaseStudyDetail,
    "SkillsChecklists": SkillsChecklists,
    "ChecklistDetail": ChecklistDetail,
    "ResourceLibrary": ResourceLibrary,
    "Discussions": Discussions,
    "Progress": Progress,
    "Certificates": Certificates,
    "AdminPanel": AdminPanel,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};