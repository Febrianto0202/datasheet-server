import { version } from '../../package.json'
import { Router } from 'express'
import { exportToFile } from '../utilities'
import copy from '../copy/en'

export default ({ config, controller }) => {
  let api = Router()
  const fileDest = config.EXPORT_FILE_DEST || ""

  api.get('/', (req, res) => {
    res.json({
      version
    })
  })

  api.get('/blueprints', (req, res) => {
    const bps = controller.blueprints()
    res.render('blueprints', {
      bps: bps.map(bp => ({
        source: bp.sheet.name,
        tab: bp.name,
        urls: bp.urls
      }))
    })
  })

  api.get('/export', (req, res) => {
    controller
      .retrieveAll(fileDest)
      .then(msg =>
        res.json({
          success: msg
        })
      )
      .catch(err =>
        res.status(404)
          .send({ error: err.message, err })
      )
  })

  api.get('/update', (req, res) => {
    controller
      .update()
      .then(msg =>
        res.json({
          success: msg
        })
      )
      .catch(err =>
        res.status(404)
          .send({ error: err.message, err })
      )
  })

  api.get('/:sheet/:tab/:resource/:frag', (req, res) => {
    const { sheet, tab, resource, frag } = req.params
    controller
      .retrieveFrag(sheet, tab, resource, frag)
      .then(data => res.json(data))
      .catch(err =>
        res.status(err.status || 404)
          .send({ error: err.message })
      )
  })

  api.get('/:sheet/:tab/:resource', (req, res) => {
    const { sheet, tab, resource } = req.params
    controller
      .retrieve(sheet, tab, resource)
      .then(data => res.json(data))
      .catch(err =>
        res.status(err.status || 404)
          .send({ error: err.message })
      )
  })

  // ERROR routes. Note that it is important that these come AFTER routes
  // like /update, so that the regex does not greedily match these routes.

  api.get('/:sheet', (req, res) => {
    res.status(400)
      .send({ error: copy.errors.onlysheet })
  })

  api.get('/:sheet/:tab', (req, res) => {
    res.status(400)
      .send({ error: copy.errors.onlyTab })
  })

  return api
}
