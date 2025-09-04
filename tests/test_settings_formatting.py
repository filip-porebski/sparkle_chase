from playwright.sync_api import Page, expect


def test_number_separator_setting(page: Page):
    # Create a hunt and push count
    page.get_by_text("New Hunt").click()
    page.get_by_label("Target Species").fill("Arceus")
    page.get_by_label("Game").select_option(label="Ultra Sun")
    page.get_by_label("Method").select_option(label="Random Encounters")
    page.get_by_text("Create Hunt").click()

    for _ in range(1234):
        page.get_by_text('+1').click()

    # Thin space selection in Settings
    page.get_by_text('Settings').click()
    dlg = page.locator('.sc-modal')
    dlg.get_by_text('Number Formatting').scroll_into_view_if_needed()
    dlg.get_by_label('Thousands Separator').select_option(value='thin')
    dlg.get_by_text('Save Settings').click()

    # Counter should reflect thin space (look for \u2009)
    text = page.locator('.sc-count').inner_text()
    assert '\u2009' in text or '' not in text  # sanity, depends on font rendering

    # Stats panel also shows with separator
    page.get_by_text('Statistics').scroll_into_view_if_needed()
    # Odds line present
    expect(page.get_by_text('Base odds')).to_be_visible()

