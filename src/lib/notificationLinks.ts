import type { Notification, UserType } from '@/types/api';

function dataField(data: Record<string, unknown> | null | undefined, key: string): string | null {
  const value = data?.[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function getNotificationPath(
  notification: Notification,
  userType: UserType,
): string | null {
  const applicationId = dataField(notification.data, 'applicationId');
  const jobId = dataField(notification.data, 'jobId');

  if (userType === 'company') {
    switch (notification.type) {
      case 'NEW_APPLICATION':
        return applicationId
          ? `/empresa/candidatos/${applicationId}`
          : jobId
            ? `/empresa/projetos/${jobId}`
            : '/empresa/candidatos';
      case 'APPLICATION_COMPLETION_PENDING':
      case 'APPLICATION_COMPLETED':
        return applicationId
          ? `/empresa/candidatos/${applicationId}`
          : jobId
            ? `/empresa/projetos/${jobId}`
            : '/empresa/candidatos';
      default:
        return null;
    }
  }

  switch (notification.type) {
    case 'APPLICATION_ACCEPTED':
    case 'APPLICATION_REJECTED':
    case 'APPLICATION_STATUS_CHANGED':
    case 'APPLICATION_COMPLETION_PENDING':
    case 'APPLICATION_COMPLETED':
      return applicationId ? `/freelancer/trabalhos/${applicationId}` : '/freelancer/trabalhos';
    case 'COMPANY_HIRING_INTEREST':
      return jobId ? `/freelancer/vagas/${jobId}` : '/freelancer/vagas';
    default:
      return null;
  }
}
