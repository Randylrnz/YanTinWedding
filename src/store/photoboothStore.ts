"use client";

import { create } from "zustand";

export type PhotoboothScreen =
  | "welcome"
  | "camera"
  | "capture"
  | "preview"
  | "generating"
  | "strip"
  | "email";

export interface SessionPhoto {
  dataUrl: string; // base64 PNG data URL
  takenAt: number; // timestamp
}

export interface PhotoboothSession {
  id: string;
  photos: SessionPhoto[];
  stripDataUrl: string | null;
  stripFilename: string | null;
  driveFileId: string | null;
  driveWebUrl: string | null;
  downloadCount: number;
  emailSent: boolean;
  emailAddress: string | null;
  guestName: string | null;
  startedAt: number;
  completedAt: number | null;
}

interface PhotoboothState {
  screen: PhotoboothScreen;
  session: PhotoboothSession | null;
  isUploading: boolean;
  uploadError: string | null;

  // Actions
  startSession: () => void;
  addPhoto: (dataUrl: string) => void;
  retakeSession: () => void;
  setStripDataUrl: (dataUrl: string, filename: string) => void;
  setDriveResult: (fileId: string, webUrl: string) => void;
  setEmailSent: (email: string, name: string | null) => void;
  setScreen: (screen: PhotoboothScreen) => void;
  setUploading: (uploading: boolean) => void;
  setUploadError: (error: string | null) => void;
  incrementDownload: () => void;
  resetSession: () => void;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function createEmptySession(): PhotoboothSession {
  return {
    id: generateSessionId(),
    photos: [],
    stripDataUrl: null,
    stripFilename: null,
    driveFileId: null,
    driveWebUrl: null,
    downloadCount: 0,
    emailSent: false,
    emailAddress: null,
    guestName: null,
    startedAt: Date.now(),
    completedAt: null,
  };
}

export const usePhotoboothStore = create<PhotoboothState>((set, get) => ({
  screen: "welcome",
  session: null,
  isUploading: false,
  uploadError: null,

  startSession: () =>
    set({
      session: createEmptySession(),
      screen: "camera",
      uploadError: null,
    }),

  addPhoto: (dataUrl) =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            photos: [
              ...state.session.photos,
              { dataUrl, takenAt: Date.now() },
            ],
          }
        : state.session,
    })),

  retakeSession: () =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            photos: [],
            stripDataUrl: null,
            stripFilename: null,
            driveFileId: null,
            driveWebUrl: null,
          }
        : createEmptySession(),
      screen: "camera",
      uploadError: null,
    })),

  setStripDataUrl: (dataUrl, filename) =>
    set((state) => ({
      session: state.session
        ? { ...state.session, stripDataUrl: dataUrl, stripFilename: filename }
        : state.session,
    })),

  setDriveResult: (fileId, webUrl) =>
    set((state) => ({
      session: state.session
        ? { ...state.session, driveFileId: fileId, driveWebUrl: webUrl }
        : state.session,
    })),

  setEmailSent: (email, name) =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            emailSent: true,
            emailAddress: email,
            guestName: name,
            completedAt: Date.now(),
          }
        : state.session,
    })),

  setScreen: (screen) => set({ screen }),

  setUploading: (uploading) => set({ isUploading: uploading }),

  setUploadError: (error) => set({ uploadError: error }),

  incrementDownload: () =>
    set((state) => ({
      session: state.session
        ? {
            ...state.session,
            downloadCount: state.session.downloadCount + 1,
            completedAt: state.session.completedAt ?? Date.now(),
          }
        : state.session,
    })),

  resetSession: () =>
    set({
      screen: "welcome",
      session: null,
      isUploading: false,
      uploadError: null,
    }),
}));
