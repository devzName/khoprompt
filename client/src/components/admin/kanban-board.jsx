import { App, Spin } from 'antd';
import { useState, useEffect, useCallback } from 'react';
import { useDarkMode } from '../../hooks/use-dark-mode';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { promptService } from '../../services/promptService';
import KanbanCard from './kanban-card';
import RejectReasonModal from './reject-reason-modal';

const COLUMNS = [
  { key: 'pending', label: 'Chờ duyệt', color: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/30 text-orange-900 dark:text-orange-200' },
  { key: 'approved', label: 'Đã duyệt', color: 'bg-green-50 dark:bg-emerald-950/20 border-green-200 dark:border-emerald-800/30 text-emerald-900 dark:text-emerald-200' },
  { key: 'rejected', label: 'Từ chối', color: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30 text-red-900 dark:text-red-200' },
];

const KanbanBoard = () => {
  const { modal, notification } = App.useApp();
  const [isDark] = useDarkMode();
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all prompts (large limit to populate board)
      const res = await promptService.getAllPrompts({ limit: 200, page: 1 });
      setPrompts(res.data || res);
    } catch {
      notification.error({ message: 'Không thể tải danh sách prompts', placement: 'topRight' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrompts(); }, [fetchPrompts]);

  const getColumn = (id) => prompts.find((p) => p.id === id)?.status;

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;

    const sourceStatus = getColumn(active.id);
    // over.id can be a column key string or a prompt id
    const destStatus = COLUMNS.find((c) => c.key === over.id)
      ? over.id
      : getColumn(over.id);

    if (!destStatus || sourceStatus === destStatus) return;

    if (destStatus === 'rejected') {
      setRejectId(active.id);
    } else if (destStatus === 'approved') {
      doApprove(active.id);
    }
  };

  const doApprove = async (id) => {
    try {
      await promptService.approvePrompt(id);
      setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p)));
      notification.success({ message: 'Đã duyệt prompt', placement: 'topRight' });
    } catch {
      notification.error({ message: 'Không thể duyệt prompt', placement: 'topRight' });
    }
  };

  const doReject = async (id, reason) => {
    try {
      await promptService.rejectPrompt(id, reason);
      setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'rejected' } : p)));
      notification.success({ message: 'Đã từ chối prompt', placement: 'topRight' });
    } catch {
      notification.error({ message: 'Không thể từ chối prompt', placement: 'topRight' });
    }
    setRejectId(null);
  };

  const handleDelete = (id) => {
    modal.confirm({
      title: 'Xóa prompt?',
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await promptService.deletePrompt(id);
          setPrompts((prev) => prev.filter((p) => p.id !== id));
          notification.success({ message: 'Đã xóa prompt', placement: 'topRight' });
        } catch {
          notification.error({ message: 'Không thể xóa prompt', placement: 'topRight' });
        }
      },
    });
  };

  const activePrompt = prompts.find((p) => p.id === activeId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 overscroll-contain">
          {COLUMNS.map((col) => {
            const colPrompts = prompts.filter((p) => p.status === col.key);
            return (
              <div
                key={col.key}
                id={col.key}
                className={`flex-1 min-w-[280px] rounded-xl border-2 p-3 ${col.color}`}
              >
                <div className="font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
                  <span>{col.label}</span>
                  <span className="text-xs bg-white dark:bg-[#1f1f1f] px-2 py-0.5 rounded-full border dark:border-gray-700">
                    {colPrompts.length}
                  </span>
                </div>
                <SortableContext
                  items={colPrompts.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2 min-h-[100px]">
                    {colPrompts.map((prompt) => (
                      <KanbanCard
                        key={prompt.id}
                        prompt={prompt}
                        onApprove={doApprove}
                        onReject={(id) => setRejectId(id)}
                        onDelete={handleDelete}
                        isMobile={isMobile}
                      />
                    ))}
                    {colPrompts.length === 0 && (
                      <div className="text-center text-gray-400 dark:text-gray-600 text-xs py-6">
                        Không có prompt
                      </div>
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        <DragOverlay>
          {activePrompt && (
            <KanbanCard
              prompt={activePrompt}
              onApprove={() => {}}
              onReject={() => {}}
              onDelete={() => {}}
              isMobile={false}
            />
          )}
        </DragOverlay>
      </DndContext>

      <RejectReasonModal
        open={!!rejectId}
        onConfirm={(reason) => doReject(rejectId, reason)}
        onCancel={() => setRejectId(null)}
      />
    </>
  );
};

export default KanbanBoard;
