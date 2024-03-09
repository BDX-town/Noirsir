import React from 'react';
import { AppContextProvider, useAppContext } from './data/AppContext';
import { ErrorBoundary } from './data/ErrorBoundary';
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Base } from './layout/Base';
import { Write } from './layout/Write';
import { TranslationContext } from '@bdxtown/canaille';
import '@mdxeditor/editor/style.css';
// import '@bdxtown/canaille/src/scss/google-fonts.scss';
import translate from 'counterpart';


import { Login } from './views/Login';
import { Posts } from './views/Posts';
import { ErrorElement } from './bits/ErrorElement';
import { BlogLocation, PostsLocation, PostLocation, MediaLocation, SettingsLocation, InviteLocation } from './views/Locations';
import { Invite } from './views/Invite';
import { Loader as BaseLoader } from './bits/Loader';


const Media = React.lazy(() => import('./views/Media'));
const Post = React.lazy(() => import('./views/Post'));
const Blog = React.lazy(() => import('./views/Blog'));
const Settings = React.lazy(() => import('./views/Settings'));

const Loader = ({ children }: { children: React.ReactNode }) => <React.Suspense fallback={<div className='grow flex items-center justify-center p-4'><BaseLoader /></div>}>{ children }</React.Suspense>


const baseRouter = createBrowserRouter([
  { 
    path: InviteLocation.path + '/' + InviteLocation.param,
    element: <Invite />
  },
  {
    path: '*',
    element: <Login />
  }
]);

const loggedRouter = createBrowserRouter([
  {
    path: PostLocation.path + "/*",
    element: <Write />,
    children: [
      {
        path: ":file",
        element: <Loader><Post /></Loader>,
        errorElement: <ErrorElement />
      },
      {
        index: true,
        element: <Post blank />,
        errorElement: <ErrorElement />
      }
    ]
  },
  {
    path: '/',
    element: <Base />,
    children: [
      {
        ...BlogLocation,
        element: <Loader><Blog /></Loader>,
        errorElement: <ErrorElement />
      },
      {
        ...PostsLocation,
        element: <Posts />,
        errorElement: <ErrorElement />
      },

      {
        ...MediaLocation,
        element: <Loader><Media /></Loader>,
        errorElement: <ErrorElement />
      },
      {
        ...SettingsLocation,
        element: <Loader><Settings/></Loader>,
        errorElement: <ErrorElement />
      },
      {
        index: true,
        element: <Navigate to={PostsLocation.path} replace />
      }
    ]
  }
]);

const Routing = () => {
  const { client } = useAppContext();
  if(!client) return <RouterProvider router={baseRouter} />
  return <RouterProvider router={loggedRouter} />
}


function App() {
  return (
    <TranslationContext
      defaultLang='fr-FR'
      __={translate}
    >
        <AppContextProvider>
          <ErrorBoundary>
              <Routing />
          </ErrorBoundary>
        </AppContextProvider>
    </TranslationContext>
  )
}

export default App
