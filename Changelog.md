# Changelog

## 0.9.0 (May 2024)

Release 0.9.0 has been developed to be compatible with `transitions` 0.9.1.

  * Updated all npm packages to their recent version
  * Aligned minor version to transitions
  * Added stub files and `py.typed`
  * Extended documentation with styling example
  * Added a legend and model names to graphs with multiple models
  * Bugfix: Add default machine name to graph when none was passed by markup
  * Bugfix #24: Edges with same source not correctly disambiguated for highlighting (thanks @Bilby42)

## 0.1.0 (June 2020)

Release 0.1.0 has been developed to be compatible with `transitions` 0.8.2.
Features include:
  * move nodes (edit mode)
  * trigger events (event mode)
  * show conditions, tags, enter/exit callbacks (Url parameter `details=true`)
  * auto layout with dagre, cose, bilkent, concentric, etc. (Url paramter `layout=<layout_name>`)
  * save current layout by name
