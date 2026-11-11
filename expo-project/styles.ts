import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.4
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 10
  },
  btnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#0f172a',
    borderRadius: 10
  },
  btnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff'
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f8fafc'
  },
  tableWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tableNode: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4
  },
  chairNode: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20
  },
  chairOccupied: {
    backgroundColor: '#0f172a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  chairVip: {
    backgroundColor: '#fef3c7',
    borderWidth: 1.5,
    borderColor: '#d97706',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  chairEmpty: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1'
  },
  chairText: {
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center'
  },
  chairTextOccupied: {
    color: '#ffffff'
  },
  chairTextVip: {
    color: '#92400e'
  },
  chairTextEmpty: {
    color: '#94a3b8'
  },
  tableNodeName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    paddingHorizontal: 6,
    textAlign: 'center'
  },
  tableNodeCapacity: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2
  },
  dockScroll: {
    flexGrow: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  dock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 20
  },
  dockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 20
  },
  roundIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#0f172a'
  },
  rectIcon: {
    width: 18,
    height: 12,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#0f172a'
  },
  squareIcon: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#0f172a'
  },
  dockButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  venueDockIcon: {
    fontSize: 15,
    fontWeight: '800',
    color: '#475569'
  },
  venueNode: {
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4
  },
  venueNodeIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a'
  },
  venueNodeName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    paddingHorizontal: 6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '80%'
  },
  venueEditor: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 28
  },
  venueSizeControls: {
    gap: 12,
    paddingVertical: 8
  },
  deleteVenueButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#fef2f2'
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#cbd5e1',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 14,
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a'
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 8
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  guestListContainer: {
    marginBottom: 20,
    flexShrink: 1
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#94a3b8',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginVertical: 8
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  guestDetails: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 2
  },
  seatNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  seatNumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b'
  },
  guestNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a'
  },
  guestDietText: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '500'
  },
  vipGuestText: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: '700',
    marginTop: 2
  },
  removeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  removeBtnText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600'
  },
  addGuestBox: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 16
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 8
  },
  vipToggle: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10
  },
  vipToggleActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#d97706'
  },
  vipToggleText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700'
  },
  vipToggleTextActive: {
    color: '#92400e'
  },
  tableControls: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    gap: 10
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  controlLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600'
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperButtonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700'
  },
  controlValue: {
    minWidth: 40,
    color: '#0f172a',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700'
  },
  rotateButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9
  },
  rotateButtonText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700'
  },
  addBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  cancelEditBtn: {
    alignItems: 'center',
    paddingVertical: 10
  },
  cancelEditText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600'
  },
  deleteTableBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20
  },
  deleteTableBtnText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600'
  }
});

export default styles;
