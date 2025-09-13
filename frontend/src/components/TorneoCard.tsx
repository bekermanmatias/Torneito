import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Crown, 
  ArrowRight,
  Eye,
  Trash2,
  Users,
  Calendar
} from 'lucide-react';
import type { Torneo } from '../types';
import ConfirmModal from './ConfirmModal';
import './TorneoCard.css';

interface TorneoCardProps {
  torneo: Torneo;
  variant?: 'dashboard' | 'torneos';
  onDelete?: (id: number) => void;
}

const TorneoCard: React.FC<TorneoCardProps> = ({ 
  torneo, 
  variant = 'dashboard',
  onDelete 
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const getTorneoStatusText = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'en_curso':
        return 'En curso';
      case 'finalizado':
        return 'Finalizado';
      default:
        return estado;
    }
  };

  // const getTorneoIcon = (tipo: string) => {
  //   switch (tipo) {
  //     case 'eliminacion':
  //       return <Trophy className="w-6 h-6 text-red-600" />;
  //     case 'liga':
  //       return <Crown className="w-6 h-6 text-blue-600" />;
  //     default:
  //       return <Trophy className="w-6 h-6 text-purple-600" />;
  //   }
  // };

  const getTorneoIconLarge = (tipo: string) => {
    switch (tipo) {
      case 'eliminacion':
        return <Trophy className="w-8 h-8 text-red-600" />;
      case 'liga':
        return <Crown className="w-8 h-8 text-blue-600" />;
      default:
        return <Trophy className="w-8 h-8 text-purple-600" />;
    }
  };

  const getTorneoTypeText = (tipo: string) => {
    switch (tipo) {
      case 'eliminacion':
        return 'Eliminación';
      case 'liga':
        return 'Liga';
      default:
        return 'Torneo';
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (onDelete) {
      onDelete(torneo.id);
    }
    setShowDeleteModal(false);
  };

  // Estilos inline para la imagen de fondo
  const cardStyle = torneo.banner_url ? {
    '--banner-url': `url(${torneo.banner_url})`
  } as React.CSSProperties : {};

  return (
    <div 
      className={`torneo-card ${torneo.banner_url ? 'has-banner' : ''}`}
      style={cardStyle}
    >
      {/* Contenido de la card */}
      <div className="torneo-content">
        {/* Header inline */}
        <div className="torneo-header-inline">
          <div className="torneo-header-content">
            <div className="flex items-center gap-3">
              {getTorneoIconLarge(torneo.tipo)}
              <div>
                <h3 className="torneo-header-title">{torneo.nombre}</h3>
                <p className="torneo-header-subtitle">{getTorneoTypeText(torneo.tipo)}</p>
              </div>
            </div>
          </div>
          
          {/* Botones de acción en la parte superior derecha */}
          <div className="flex items-center gap-2">
            {/* Tag de estado */}
            <div className="torneo-header-status">
              {getTorneoStatusText(torneo.estado)}
            </div>
            
            {/* Botones según la variante */}
            {variant === 'dashboard' ? (
              <Link
                to={`/torneo/${torneo.id}`}
                className="torneo-action-button-compact"
                title="Ver detalles"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to={`/torneo/${torneo.id}`}
                  className="torneo-detail-button-compact"
                  title="Ver detalles"
                >
                  <Eye className="w-4 h-4" />
                </Link>
                
                {onDelete && (
                  <button
                    onClick={handleDelete}
                    className="torneo-delete-button-compact"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        
        
        
        {/* Información del torneo */}
        <div className="torneo-info">
          <div className="torneo-info-item">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            <span className="torneo-info-label">Equipos:</span>
            <span className="torneo-info-value">{torneo.equipos?.length || 0}</span>
          </div>
          
          <div className="torneo-info-item">
            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
            <span className="torneo-info-label">Fecha:</span>
            <span className="torneo-info-value">
              {new Date(torneo.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          {/* Campeón si está finalizado */}
          {torneo.estado === 'finalizado' && torneo.campeon && (
            <div className="torneo-campeon">
              <div className="torneo-campeon-content">
                <Trophy className="torneo-campeon-icon" />
                <div>
                  <span className="torneo-campeon-label">Campeón:</span>
                  <span className="torneo-campeon-name ml-2">
                    {torneo.campeon.nombre}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        

      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Torneo"
        message={`¿Estás seguro de que quieres eliminar el torneo "${torneo.nombre}"?\n\nEsta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default TorneoCard;
