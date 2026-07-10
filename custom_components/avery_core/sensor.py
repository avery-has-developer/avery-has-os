"""Avery Core version/health sensor.

Also the reason Avery Core is an integration rather than pure frontend
resources: an integration is counted in Home Assistant's public analytics,
giving the ecosystem a real install signal.
"""
from __future__ import annotations

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, VERSION


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    async_add_entities([AveryCoreVersionSensor(entry)])


class AveryCoreVersionSensor(SensorEntity):
    """Reports the installed Avery Core version."""

    _attr_has_entity_name = True
    _attr_name = "Version"
    _attr_icon = "mdi:hexagon-multiple"
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_should_poll = False

    def __init__(self, entry: ConfigEntry) -> None:
        self._attr_unique_id = f"{entry.entry_id}_version"
        self._attr_native_value = VERSION
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name="Avery Core",
            manufacturer="Avery HAS OS",
            model="Core",
            sw_version=VERSION,
        )
