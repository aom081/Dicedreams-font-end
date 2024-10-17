import { createBrowserRouter } from "react-router-dom";
import Main from '../layout/layoutMain';
import Home from '../pages/Home';
import Post from "../components/Post";
import CreatePost from "../pages/Createpost";
import Rules from "../pages/Rule";
import LoginPage from "../pages/loginRegister";
import NotificationPage from "../pages/NotificationPage";
import ParticipationHistory from '../pages/ParticipationHistory';
import EventDetailPage from '../pages/DetailPage';
import Profile from '../pages/Profile';
import ProfileView from '../pages/ProfileView';
import ProfileEdit from '../pages/ProfileEdit';
import Index from '../pages/Index';
import EditPostGamePage from "../pages/EditPostGamePage ";
import Store from '../pages/store';
import StoreAc from "../pages/storeActivity";
import EditParticipantsPage from '../pages/EditParticipantsPage';
import Adm from "../pages/Admin";
import AcEdit from "../pages/storeAcEdit";
import SearchResults from "../components/SearchResults"; // Import SearchResults component

const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/rules",
        element: <Rules />
      },
      {
        path: "/login",
        element: <LoginPage />
      },
      {
        path: "/post",
        element: <Post />
      },
      {
        path: "/create-post",
        element: <CreatePost />
      },
      {
        path: "/notifications",
        element: <NotificationPage />
      },
      {
        path: "/participation-history",
        element: <ParticipationHistory />
      },
      {
        path: "/events/:id",
        element: <EventDetailPage />
      },
      {
        path: "/edit-event/:id",
        element: <EditPostGamePage />
      },
      {
        path: "/profile",
        element: <Profile />
      },
      {
        path: "/profile/edit",
        element: <ProfileEdit />
      },
      {
        path: "/index",
        element: <Index />
      },
      {
        path: "/store",
        element: <Store />
      },
      {
        path: "/store/createAc",
        element: <StoreAc />
      },
      {
        path: "/edit-participants/:id",
        element: <EditParticipantsPage />
      },
      {
        path: "/manage_contracts",
        element: <Adm />
      },
      {
        path: "/store/editActivity/:encodedId",
        element: <AcEdit />
      },
      {
        path: "/profile/user/:encodedId",
        element: <ProfileView />
      },
      {
        path: "/search-results",  // New route for search results
        element: <SearchResults />
      }
    ]
  }
]);

export default router;
