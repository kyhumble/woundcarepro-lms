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
import AdminPanel from './pages/AdminPanel';
import ContentEditor from './pages/ContentEditor';
import CaseStudies from './pages/CaseStudies';
import Onboarding from './pages/Onboarding';
import Pricing from './pages/Pricing';
import Search from './pages/Search';
import Settings from './pages/Settings';
import CaseStudyDetail from './pages/CaseStudyDetail';
import Certificates from './pages/Certificates';
import ChecklistDetail from './pages/ChecklistDetail';
import Dashboard from './pages/Dashboard';
import Discussions from './pages/Discussions';
import Home from './pages/Home';
import Leaderboard from './pages/Leaderboard';
import LearningPathDetail from './pages/LearningPathDetail';
import LearningPaths from './pages/LearningPaths';
import MockExamDetail from './pages/MockExamDetail';
import MockExams from './pages/MockExams';
import ModuleDetail from './pages/ModuleDetail';
import Modules from './pages/Modules';
import Portfolio from './pages/Portfolio';
import Progress from './pages/Progress';
import QuizPage from './pages/QuizPage';
import ResourceDetail from './pages/ResourceDetail';
import ResourceLibrary from './pages/ResourceLibrary';
import SkillMastery from './pages/SkillMastery';
import SkillsChecklists from './pages/SkillsChecklists';
import StudyPlanner from './pages/StudyPlanner';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminPanel": AdminPanel,
    "ContentEditor": ContentEditor,
    "CaseStudies": CaseStudies,
    "CaseStudyDetail": CaseStudyDetail,
    "Certificates": Certificates,
    "ChecklistDetail": ChecklistDetail,
    "Dashboard": Dashboard,
    "Discussions": Discussions,
    "Home": Home,
    "Leaderboard": Leaderboard,
    "LearningPathDetail": LearningPathDetail,
    "LearningPaths": LearningPaths,
    "MockExamDetail": MockExamDetail,
    "MockExams": MockExams,
    "ModuleDetail": ModuleDetail,
    "Modules": Modules,
    "Portfolio": Portfolio,
    "Progress": Progress,
    "QuizPage": QuizPage,
    "ResourceDetail": ResourceDetail,
    "ResourceLibrary": ResourceLibrary,
    "SkillMastery": SkillMastery,
    "SkillsChecklists": SkillsChecklists,
    "StudyPlanner": StudyPlanner,
    "Onboarding": Onboarding,
    "Pricing": Pricing,
    "Search": Search,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};