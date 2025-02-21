import { useCallback, useEffect, useState } from 'react'

import { Button, Modal } from '@janhq/joi'
import { useAtom, useAtomValue } from 'jotai'

import useCortex from '@/hooks/useCortex'

import Spinner from '../Loader/Spinner'

import { waitingForCortexAtom } from '@/helpers/atoms/App.atom'
import { hostAtom, janDataFolderPathAtom } from '@/helpers/atoms/AppConfig.atom'

const WaitingForCortexModal: React.FC = () => {
  const host = useAtomValue(hostAtom)
  const [waitingForCortex, setWaitingForCortex] = useAtom(waitingForCortexAtom)
  const [timedOut, setTimedOut] = useState(false)
  const { isSystemAlive } = useCortex()
  const [janDataFolderPath, setJanDataFolderPath] = useAtom(
    janDataFolderPathAtom
  )

  const checkSystemAlive = useCallback(async () => {
    setWaitingForCortex(!(await isSystemAlive()))
  }, [setWaitingForCortex, isSystemAlive])

  const getAppDataFolder = useCallback(async () => {
    return window.electronAPI?.appDataFolder().then(setJanDataFolderPath)
  }, [setJanDataFolderPath])

  // Check health for the first time on mount
  useEffect(() => {
    checkSystemAlive()
    getAppDataFolder()
  }, [checkSystemAlive, getAppDataFolder])

  useEffect(() => {
    setTimeout(() => {
      if (waitingForCortex) setTimedOut(true)
    }, 5000)
  }, [waitingForCortex])

  return (
    <Modal
      hideClose
      open={waitingForCortex}
      className="w-auto"
      content={
        <div className="inline-flex flex-col">
          {timedOut ? (
            <>
              <h1 className="inline text-base font-bold">
                {`Hmm, Jan's taking longer than usual to start up...`}
              </h1>
              <p className="mt-[2px] text-[hsla(var(--text-secondary))]">
                API Server starting at{' '}
                <a
                  href={`${host}/api`}
                  target="_blank"
                  className="text-[hsla(var(--app-link))] hover:underline"
                >
                  {host}/api
                </a>
                <br />
                <br />
                <span>
                  Check logs at{' '}
                  <span
                    onClick={() => window?.electronAPI?.openAppLog()}
                    className="cursor-pointer text-[hsla(var(--app-link))]"
                  >
                    {janDataFolderPath}
                  </span>{' '}
                  if this persists or restart app.
                </span>
              </p>
            </>
          ) : (
            <h1 className="inline text-base font-bold">
              Jan is getting ready! This usually <br /> takes a few seconds...
            </h1>
          )}
          <div className="mx-auto my-4 inline-block">
            <Spinner className="h-8 w-8" />
          </div>
          {timedOut && (
            <Button
              className="ml-auto inline-flex"
              onClick={() => window.core?.api?.relaunch()}
            >
              Restart App
            </Button>
          )}
        </div>
      }
    />
  )
}

export default WaitingForCortexModal
