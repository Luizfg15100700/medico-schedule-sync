
import { useState } from 'react';
import { Subject } from '@/types';

export const useAppState = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>();
  const [editingScheduleSubject, setEditingScheduleSubject] = useState<Subject | undefined>();
  const [activeView, setActiveView] = useState('schedule');

  const openAddModal = () => {
    setEditingSubject(undefined);
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setEditingSubject(undefined);
  };

  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setIsAddModalOpen(true);
  };

  const openScheduleEditor = (subject: Subject) => {
    setEditingScheduleSubject(subject);
    setIsScheduleEditorOpen(true);
  };

  const closeScheduleEditor = () => {
    setIsScheduleEditorOpen(false);
    setEditingScheduleSubject(undefined);
  };

  return {
    // Modal states
    isAddModalOpen,
    isFilterModalOpen,
    isScheduleEditorOpen,
    editingSubject,
    editingScheduleSubject,
    activeView,
    // Modal actions
    setIsFilterModalOpen,
    setActiveView,
    openAddModal,
    closeAddModal,
    openEditModal,
    openScheduleEditor,
    closeScheduleEditor,
  };
};
