import React from 'react';
import Badge from '@/Components/Badge';
import { ShieldCheck, CheckCircle2, Building2, Calendar, User, Award, FileText } from 'lucide-react';

export default function ReportsVerify({ inspection, stats = {} }) {
    // Extracción defensiva y adaptativa de propiedades (Español e Inglés)
    const empresaObj = inspection?.empresa || inspection?.company;
    const razonSocial = empresaObj?.razon_social || empresaObj?.business_name || 'Establecimiento';
    const cuit = empresaObj?.cuit || empresaObj?.tax_id || '-';
    const sectorIndustrial = empresaObj?.sector_industrial || empresaObj?.industry_sector || empresaObj?.rubro || '-';
    
    const fechaBruta = inspection?.fecha_inicio || inspection?.inspection_date;
    const fechaFormateada = fechaBruta ? new Date(fechaBruta).toLocaleDateString('es-AR') : '-';
    
    const inspectorNombre = inspection?.usuario?.name || inspection?.user?.name || 'Inspector Responsable';
    const inspectorMatricula = inspection?.usuario?.numero_matricula || inspection?.user?.license_number || '';
    
    const estadoGlobal = inspection?.estado || inspection?.status || 'Verificado';
    const tasaConformidad = stats?.tasa_conformidad ?? stats?.compliance_rate ?? 0;
    const tokenValidacion = inspection?.token || 'TOKEN-NO-DISPONIBLE';

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Fondo ambiental con resplandor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-xl mx-auto w-full relative z-10 space-y-6">
                {/* Encabezado con insignia de certificación */}
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

                {/* Tarjeta de Certificado */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/10 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                Código Único de Validación (Token)
                            </span>
                            <span className="font-mono text-xs font-bold text-slate-800 break-all">
                                {tokenValidacion}
                            </span>
                        </div>
                        <Badge>{estadoGlobal}</Badge>
                    </div>

                    {/* Detalle del Establecimiento y Auditoría */}
                    <div className="space-y-3 text-xs">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Establecimiento:</span>
                                <strong className="text-slate-900 text-right font-semibold">{razonSocial}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">CUIT:</span>
                                <strong className="font-mono text-slate-800">{cuit}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Sector Industrial:</span>
                                <strong className="text-slate-800">{sectorIndustrial}</strong>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Fecha de Auditoría:</span>
                                <strong className="text-slate-800">{fechaFormateada}</strong>
                            </div>
                        </div>

                        {/* Inspector Responsable y Conformidad */}
                        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Inspector Responsable:</span>
                                <strong className="text-blue-950 font-semibold">{inspectorNombre}</strong>
                            </div>
                            {inspectorMatricula && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Matrícula Profesional:</span>
                                    <strong className="font-mono text-blue-900">{inspectorMatricula}</strong>
                                </div>
                            )}
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Tasa de Conformidad:</span>
                                <strong className="text-emerald-700 font-bold">{tasaConformidad}%</strong>
                            </div>
                        </div>
                    </div>

                    {/* Declaración de autenticidad legal */}
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                        <p className="text-xs font-semibold text-emerald-900">
                            ✓ Este informe técnico cuenta con firma digital registrada y plena validez legal.
                        </p>
                    </div>

                    <div className="text-center pt-2">
                        <a
                            href="/login"
                            className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
                        >
                            Acceder al Sistema HyS Control →
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}