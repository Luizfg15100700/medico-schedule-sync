
import React from 'react';
import { AddSubjectModal } from '@/components/AddSubjectModal';
import { ClassScheduleEditor } from '@/components/ClassScheduleEditor';
import { FilterModal, FilterOptions } from '@/components/FilterModal';
import { Subject } from '@/types';

interface AppModalsProps {
  isAddModalOpen: boolean;
  isFilterModalOpen: boolean;
  isScheduleEditorOpen: boolean;
  editingSubject?: Subject;
  editingScheduleSubject?: Subject;
  filters: FilterOptions;
  onCloseAddModal: () => void;
  onCloseFilterModal: () => void;
  onCloseScheduleEditor: () => void;
  onSaveSubject: (subject: any) => void;
  onUpdateSubject: (subjectData: any) => void;
  onUpdateSchedule: (updatedSubject: Subject) => void;
  onApplyFilters: (newFilters: FilterOptions) => void;
}

export const AppModals: React.FC<AppModalsProps> = ({
  isAddModalOpen,
  isFilterModalOpen,
  isScheduleEditorOpen,
  editingSubject,
  editingScheduleSubject,
  filters,
  onCloseAddModal,
  onCloseFilterModal,
  onCloseScheduleEditor,
  onSaveSubject,
  onUpdateSubject,
  onUpdateSchedule,
  onApplyFilters
}) => {
  return (
    <>
      <AddSubjectModal
        isOpen={isAddModalOpen}
        onClose={onCloseAddModal}
        onSave={editingSubject ? onUpdateSubject : onSaveSubject}
        subject={editingSubject}
      />

      {editingScheduleSubject && (
        <ClassScheduleEditor
          isOpen={isScheduleEditorOpen}
          onClose={onCloseScheduleEditor}
          subject={editingScheduleSubject}
          onSave={onUpdateSchedule}
        />
      )}

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={onCloseFilterModal}
        onApplyFilters={onApplyFilters}
        currentFilters={filters}
      />
    </>
  );
};
