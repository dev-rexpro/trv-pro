// @ts-nocheck
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import useExchangeStore from '../stores/useExchangeStore';
import { TbCheck } from 'react-icons/tb';
import { MdEditNote } from 'react-icons/md';

interface FavoritesBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    selected: string;
    onSelect: (val: string) => void;
    options?: string[];
}

const FavoritesBottomSheet = ({ isOpen, onClose, selected, onSelect, options = ['All', 'Futures', 'Spot'] }: FavoritesBottomSheetProps) => {
    const { setManageGroupsOpen } = useExchangeStore();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 z-[80]"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[90] flex flex-col pt-3 pb-safe max-h-[70vh] overflow-y-auto"
                    >
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

                        <div className="flex justify-between items-center px-6 mb-6">
                            <h2 className="text-[22px] font-bold text-slate-900">Favorites</h2>
                            <MdEditNote size={24} className="text-slate-900 cursor-pointer" onClick={() => {
                                setManageGroupsOpen(true);
                                onClose();
                            }} />
                        </div>

                        <div className="px-6 space-y-6 pb-8">
                            {options.map(opt => (
                                <div
                                    key={opt}
                                    onClick={() => onSelect(opt)}
                                    className="flex justify-between items-center cursor-pointer active:opacity-70"
                                >
                                    <span className={`text-[16px] text-slate-900 ${selected === opt ? 'font-bold' : 'font-medium'}`}>{opt}</span>
                                    {selected === opt && (
                                        <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                                            <TbCheck size={12} className="text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FavoritesBottomSheet;
