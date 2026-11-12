import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fbf7ef'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fbf7ef',
    borderBottomWidth: 1,
    borderBottomColor: '#e5d9c8'
  },
  headerText: {
    flex: 1,
    flexShrink: 1,
    marginRight: 12
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerMark: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eee1c9'
  },
  headerTitle: {
    flex: 1,
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#51463c',
    letterSpacing: -0.4
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#84796d',
    fontWeight: '500',
    fontStyle: 'italic',
    letterSpacing: 1.1,
    marginTop: 3
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
    backgroundColor: '#efe5d6',
    borderRadius: 10
  },
  btnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#51463c'
  },
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#766354',
    borderRadius: 10
  },
  btnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fffaf2'
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f4edde'
  },
  canvasScene: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%'
  },
  tableWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tableNode: {
    backgroundColor: '#fcf9f2',
    borderWidth: 2,
    borderColor: '#b8a48c',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#716455',
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
    backgroundColor: '#766354',
    shadowColor: '#716455',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  chairVip: {
    backgroundColor: '#eee1c9',
    borderWidth: 1.5,
    borderColor: '#ad9166',
    shadowColor: '#ad9166',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  chairEmpty: {
    backgroundColor: '#fcf9f2',
    borderWidth: 1.5,
    borderColor: '#d8cbb8'
  },
  chairText: {
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center'
  },
  chairTextOccupied: {
    color: '#fffaf2'
  },
  chairTextVip: {
    color: '#705b3d'
  },
  chairTextEmpty: {
    color: '#9a8d7c'
  },
  tableNodeName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#51463c',
    paddingHorizontal: 6,
    textAlign: 'center'
  },
  tableNodeCapacity: {
    fontSize: 10,
    color: '#84796d',
    fontWeight: '600',
    marginTop: 2
  },
  dockScroll: {
    flexGrow: 0,
    backgroundColor: '#fbf7ef',
    borderTopWidth: 1,
    borderTopColor: '#e5d9c8'
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
    backgroundColor: '#efe5d6',
    borderRadius: 20
  },
  roundIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#a58a69'
  },
  rectIcon: {
    width: 18,
    height: 12,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#a58a69'
  },
  squareIcon: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#a58a69'
  },
  dockButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#51463c'
  },
  venueDockIcon: {
    fontSize: 15,
    fontWeight: '800',
    color: '#817260'
  },
  venueNode: {
    borderWidth: 2,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#716455',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4
  },
  venueNodeIcon: {
    fontSize: 18,
    fontWeight: '800',
    color: '#51463c'
  },
  venueNodeName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#51463c',
    textAlign: 'center',
    paddingHorizontal: 6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(81,70,60,0.32)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fbf7ef',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '80%'
  },
  settingsPage: {
    flex: 1,
    backgroundColor: '#fbf7ef',
    padding: 20
  },
  settingsPageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9dfd0',
    paddingBottom: 14,
    marginBottom: 18
  },
  settingsSectionHeading: {
    marginTop: 22
  },
  settingsPrimaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#766354',
    marginTop: 2
  },
  settingsPrimaryButtonText: {
    color: '#fffaf2',
    fontSize: 13,
    fontWeight: '700'
  },
  settingsEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5d9c8',
    marginBottom: 8
  },
  settingsEventSelect: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    paddingRight: 10
  },
  settingsEventDelete: {
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  settingsEventDeleteText: {
    color: '#a35f59',
    fontSize: 12,
    fontWeight: '700'
  },
  settingsEventDeleteDisabled: {
    color: '#c9bdad'
  },
  settingsEventRowActive: {
    backgroundColor: '#f1e8d9',
    borderColor: '#cabb9f'
  },
  settingsEventName: {
    flex: 1,
    color: '#51463c',
    fontSize: 13,
    fontWeight: '700'
  },
  settingsEventState: {
    color: '#806c55',
    fontSize: 12,
    fontWeight: '700'
  },
  settingsActions: {
    flexDirection: 'row',
    gap: 10
  },
  settingsActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#efe5d6'
  },
  settingsActionText: {
    color: '#51463c',
    fontSize: 13,
    fontWeight: '700'
  },
  settingsHelpText: {
    color: '#84796d',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 16
  },
  venueEditor: {
    backgroundColor: '#fbf7ef',
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
    backgroundColor: '#f1e7d8'
  },
  sheetHandleArea: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -12,
    marginBottom: 4
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#dfd1bd',
    borderRadius: 3,
    alignSelf: 'center'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9dfd0',
    paddingBottom: 14,
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#51463c'
  },
  tableNameInput: {
    minWidth: 180,
    maxWidth: 260,
    paddingVertical: 2,
    paddingHorizontal: 0,
    fontSize: 17,
    fontWeight: '800',
    color: '#51463c'
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#84796d',
    marginTop: 2
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#efe5d6',
    borderRadius: 8
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#51463c'
  },
  guestListContainer: {
    marginBottom: 20,
    flexShrink: 1
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#9a8d7c',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 13,
    color: '#9a8d7c',
    fontStyle: 'italic',
    marginVertical: 8
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9dfd0'
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
    backgroundColor: '#efe5d6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  seatNumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#84796d'
  },
  guestNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#51463c'
  },
  guestDietText: {
    fontSize: 11,
    color: '#a35f59',
    fontWeight: '500'
  },
  vipGuestText: {
    fontSize: 10,
    color: '#705b3d',
    fontWeight: '700',
    marginTop: 2
  },
  removeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  removeBtnText: {
    fontSize: 12,
    color: '#a35f59',
    fontWeight: '600'
  },
  addGuestBox: {
    backgroundColor: '#f4edde',
    padding: 14,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 16
  },
  input: {
    backgroundColor: '#fcf9f2',
    borderWidth: 1,
    borderColor: '#e5d9c8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#51463c',
    marginBottom: 8
  },
  vipToggle: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#fcf9f2',
    borderWidth: 1,
    borderColor: '#e5d9c8',
    marginBottom: 10
  },
  vipToggleActive: {
    backgroundColor: '#eee1c9',
    borderColor: '#ad9166'
  },
  vipToggleText: {
    color: '#817260',
    fontSize: 12,
    fontWeight: '700'
  },
  vipToggleTextActive: {
    color: '#705b3d'
  },
  tableControls: {
    borderTopWidth: 1,
    borderTopColor: '#e9dfd0',
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
    color: '#817260',
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
    backgroundColor: '#efe5d6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperButtonText: {
    color: '#51463c',
    fontSize: 18,
    fontWeight: '700'
  },
  controlValue: {
    minWidth: 40,
    color: '#51463c',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700'
  },
  rotateButton: {
    backgroundColor: '#efe5d6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9
  },
  rotateButtonText: {
    color: '#51463c',
    fontSize: 12,
    fontWeight: '700'
  },
  addBtn: {
    backgroundColor: '#766354',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  addBtnText: {
    color: '#fffaf2',
    fontSize: 13,
    fontWeight: '700'
  },
  cancelEditBtn: {
    alignItems: 'center',
    paddingVertical: 10
  },
  cancelEditText: {
    color: '#84796d',
    fontSize: 12,
    fontWeight: '600'
  },
  deleteTableBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20
  },
  deleteTableBtnText: {
    color: '#a35f59',
    fontSize: 13,
    fontWeight: '600'
  }
});

export default styles;
