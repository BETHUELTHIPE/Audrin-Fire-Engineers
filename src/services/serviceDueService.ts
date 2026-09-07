import {
  CLIENT_SITE_MAINTENANCE_PROFILES,
  SANS_10139_REQUIREMENT_NOTES
} from '../data/serviceDueData';
import {
  ClientSiteMaintenanceProfile,
  SiteMaintenanceInterval,
  SANS10139IntervalKey,
  MaintenanceUrgencyStatus,
  ServiceDueFilterState
} from '../types/serviceDue';

class ServiceDueService {
  private profiles: ClientSiteMaintenanceProfile[] = [...CLIENT_SITE_MAINTENANCE_PROFILES];

  public getAllProfiles(): ClientSiteMaintenanceProfile[] {
    return [...this.profiles];
  }

  public getProfileBySiteId(siteId: string): ClientSiteMaintenanceProfile | undefined {
    return this.profiles.find((p) => p.siteId === siteId);
  }

  public getFilteredProfiles(filter: ServiceDueFilterState): ClientSiteMaintenanceProfile[] {
    return this.profiles.filter((site) => {
      // Site match
      if (filter.selectedSite !== 'all' && site.siteId !== filter.selectedSite) {
        return false;
      }

      // Category match
      if (filter.selectedCategory !== 'all' && !site.systemCategory.includes(filter.selectedCategory)) {
        return false;
      }

      // Status match based on the most urgent interval or target interval
      if (filter.selectedStatus !== 'all') {
        if (filter.selectedInterval !== 'all') {
          const targetInterval = site.intervals[filter.selectedInterval as SANS10139IntervalKey];
          if (targetInterval && targetInterval.status !== filter.selectedStatus) {
            return false;
          }
        } else {
          // Check if any interval matches the status
          const hasStatus = Object.values(site.intervals).some(
            (i) => i.status === filter.selectedStatus
          );
          if (!hasStatus) return false;
        }
      }

      // Text search match
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const matchesName = site.siteName.toLowerCase().includes(query);
        const matchesClient = site.clientOrganisation.toLowerCase().includes(query);
        const matchesCity = site.city.toLowerCase().includes(query);
        const matchesPanel = site.panelModel.toLowerCase().includes(query);
        const matchesTech = Object.values(site.intervals).some((i) =>
          i.assignedTechnician.name.toLowerCase().includes(query) ||
          i.assignedTechnician.saqccNumber.toLowerCase().includes(query) ||
          i.label.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesClient && !matchesCity && !matchesPanel && !matchesTech) {
          return false;
        }
      }

      return true;
    });
  }

  public getSummaryMetrics() {
    const allSites = this.profiles;
    let overdueCount = 0;
    let dueSoonCount = 0;
    let scheduledCount = 0;
    let compliantCount = 0;
    let totalDevices = 0;
    let totalLoops = 0;

    allSites.forEach((site) => {
      totalDevices += site.deviceCount;
      totalLoops += site.loopCount;
      const urgent = site.mostUrgentInterval;
      if (urgent.status === 'overdue') overdueCount++;
      else if (urgent.status === 'due_soon') dueSoonCount++;
      else if (urgent.status === 'scheduled') scheduledCount++;
      else compliantCount++;
    });

    const averageCompliance = Math.round(
      allSites.reduce((sum, s) => sum + s.overallComplianceScore, 0) / (allSites.length || 1)
    );

    return {
      totalSites: allSites.length,
      totalDevices,
      totalLoops,
      overdueCount,
      dueSoonCount,
      scheduledCount,
      compliantCount,
      averageCompliance
    };
  }

  /**
   * Export all maintenance schedules to CSV format conforming to SANS 10139 log standards
   */
  public exportMaintenanceHistoryCsv(siteId?: string): string {
    const sites = siteId
      ? this.profiles.filter((s) => s.siteId === siteId)
      : this.profiles;

    const headers = [
      'Site Name',
      'Client Organisation',
      'Location / City',
      'System Category',
      'Panel Model',
      'Interval Type',
      'SANS 10139 Standard Clause',
      'Frequency Cycle (Days)',
      'Last Completed Date',
      'Next Service Due Date',
      'Days Remaining',
      'Compliance Status',
      'Cycle Elapsed %',
      'Assigned SAQCC Technician',
      'Technician SAQCC Number',
      'Required SAQCC Qualification',
      'Statutory Scope Mandate',
      'Last Issued Certificate Ref'
    ];

    const rows: string[][] = [];

    sites.forEach((site) => {
      Object.values(site.intervals).forEach((interval) => {
        rows.push([
          `"${site.siteName.replace(/"/g, '""')}"`,
          `"${site.clientOrganisation.replace(/"/g, '""')}"`,
          `"${site.city.replace(/"/g, '""')}"`,
          `"${site.systemCategory.replace(/"/g, '""')}"`,
          `"${site.panelModel.replace(/"/g, '""')}"`,
          `"${interval.label.replace(/"/g, '""')}"`,
          `"${interval.standardClause.replace(/"/g, '""')}"`,
          `${interval.cycleDays}`,
          `"${interval.lastCompletedDate}"`,
          `"${interval.nextDueDate}"`,
          `${interval.daysRemaining}`,
          `"${interval.status.toUpperCase()}"`,
          `${interval.cycleElapsedPercent}%`,
          `"${interval.assignedTechnician.name.replace(/"/g, '""')}"`,
          `"${interval.assignedTechnician.saqccNumber.replace(/"/g, '""')}"`,
          `"${interval.assignedTechnician.role.replace(/"/g, '""')}"`,
          `"${interval.requirementDetail.mandatoryScope.join('; ').replace(/"/g, '""')}"`,
          `"${interval.lastCertificateNumber || 'N/A'}"`
        ]);
      });
    });

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public downloadMaintenanceCsv(siteId?: string, filename?: string): void {
    const csvContent = this.exportMaintenanceHistoryCsv(siteId);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      filename || `SANS_10139_Maintenance_Schedule_${siteId ? siteId : 'All_Sites'}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const serviceDueService = new ServiceDueService();
