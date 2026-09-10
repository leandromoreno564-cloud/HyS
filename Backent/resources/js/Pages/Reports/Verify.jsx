import React from 'react';
import Badge from '@/Components/Badge';
import { ShieldCheck, CheckCircle2, Building2, Calendar, User, Award, FileText } from 'lucide-react';

export default function ReportsVerify({ inspection, stats = {} }) {
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-xl mx-auto w-full relative z-10 space-y-6">
                {/* Header Badge */}
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-2 shadow-lg">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-widest">
                        Documento Oficial Verificado
                    </span>
                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Certificado de Inspección de Seguridad
                    </h1>
                    <p className="text-xs text-slate-400">
                        Sistema Institucional de Gestión Integral de Higiene y Seguridad Laboral
                    </p>
                </div>

                {/* Certificate Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Código Único de Validación (Token)
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-800 break-all">
                                {inspection.token}
                            </span>
                        </div>
                        <Badge>{inspection.status}</Badge>
                    </div>

                    {/* Company and Inspection Details */}
                    <div className="space-y-3 text-xs">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Establecimiento:</span>
                                <strong className="text-slate-900 text-right">{inspection.company?.business_name}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">CUIT:</span>
                                <strong className="font-mono text-slate-800">{inspection.company?.tax_id}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Sector Industrial:</span>
                                <strong className="text-slate-800">{inspection.company?.industry_sector}</strong>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Fecha de Auditoría:</span>
                                <strong className="text-slate-800">
                                    {inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString('es-AR') : '-'}
                                </strong>
                            </div>
                        </div>

                        {/* Inspector Responsable */}
                        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Inspector Responsable:</span>
                                <strong className="text-blue-950">{inspection.user?.name}</strong>
                            </div>
                            {inspection.user?.license_number && (
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Matrícula Profesional:</span>
                                    <strong className="font-mono text-blue-900">{inspection.user?.license_number}</strong>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span className="text-slate-500">Tasa de Conformidad:</span>
                                <strong className="text-emerald-700 font-bold">{stats.compliance_rate || 0}%</strong>
                            </div>
                        </div>
                    </div>

                    {/* Authenticity statement */}
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                        <p className="text-xs font-semibold text-emerald-900">
                            ✓ Este informe técnico cuenta con firma digital registrada y plena validez legal.
                        </p>
                    </div>

                    <div className="text-center pt-2">
                        <a
                            href="/"
                            className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                            Acceder al Sistema HyS Control →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
