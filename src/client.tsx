/// <reference types="vite/client" />
import { hydrateRoot } from "react-dom/client";
import { createRouter } from "./router";
import '@/styles/index.css';
import { StartClient } from "@tanstack/react-start";


// Create router with queryClient context
const router = createRouter();

hydrateRoot(
  document, <StartClient router={router}  />,
);