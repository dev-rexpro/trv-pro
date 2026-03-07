// @ts-nocheck
import React from 'react';
import { motion } from 'motion/react';
import useExchangeStore from '../stores/useExchangeStore';
import { LuChevronLeft, LuPlus, LuEye, LuEyeOff, LuMenu } from 'react-icons/lu';

const ManageGroupsView = () => {
    const { setManageGroupsOpen, favoriteGroups } = useExchangeStore();

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-[300] flex flex-col"
        >
            <div className="flex justify-between items-center px-4 py-4 border-b border-slate-100">
                <LuChevronLeft size={24} className="text-slate-900 cursor-pointer" onClick={() => window.history.back()} />
                <h2 className="text-[18px] font-bold text-slate-900">Manage groups</h2>
                <LuPlus size={24} className="text-slate-900 cursor-pointer" />
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="px-4 py-4 flex justify-between text-xs font-medium text-slate-400">
                    <span>Name</span>
                    <div className="flex gap-3">
                        <span>Edit</span>
                        <span>Hide</span>
                        <span>Sort</span>
                    </div>
                </div>

                <div className="px-4 space-y-6">
                    {['All', 'Futures', 'Spot', ...Object.keys(favoriteGroups)].map(opt => (
                        <div key={opt} className="flex justify-between items-center">
                            <span className="text-[16px] font-medium text-slate-900">{opt}</span>
                            <div className="flex items-center gap-4">
                                <LuEye size={20} className="text-slate-900" />
                                <LuMenu size={20} className="text-slate-900" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="px-4 mt-8 mb-4">
                    <span className="text-xs font-medium text-slate-400">Hidden</span>
                </div>

                <div className="px-4 space-y-6 pb-8">
                    {['Crypto', 'Options'].map(opt => (
                        <div key={opt} className="flex justify-between items-center opacity-50">
                            <span className="text-[16px] font-medium text-slate-900">{opt}</span>
                            <div className="flex items-center gap-4">
                                <LuEyeOff size={20} className="text-slate-900" />
                                <LuMenu size={20} className="text-slate-900" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

export default ManageGroupsView;
