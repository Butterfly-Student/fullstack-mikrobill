import { z } from 'zod';
import { createServerFn } from '@tanstack/react-start';
import { createMikrotikHotspot } from '@/lib/mikrotik/hotspot';


export const setExpiredMon = createServerFn()
  .validator((data) => {
    return z
      .object({
        routerId: z.number().min(1, 'Router ID is required'),
      })
      .parse(data)
  })
  .handler(async ({ data }) => {
    try {
      const { routerId } = data

      const hotspot = await createMikrotikHotspot(routerId)
      const script = `:local dateint do={:local montharray ( "jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec" );:local days [ :pick $d 4 6 ];:local month [ :pick $d 0 3 ];:local year [ :pick $d 7 11 ];:local monthint ([ :find $montharray $month]);:local month ($monthint + 1);:if ( [len $month] = 1) do={:local zero ("0");:return [:tonum ("$year$zero$month$days")];} else={:return [:tonum ("$year$month$days")];}};:local timeint do={:local hours [ :pick $t 0 2 ];:local minutes [ :pick $t 3 5 ];:return ($hours * 60 + $minutes) ;};:local date [ /system clock get date ];:local time [ /system clock get time ];:local today [$dateint d=$date] ;:local curtime [$timeint t=$time] ;:local tyear [ :pick $date 7 11 ];:local lyear ($tyear-1);:foreach i in [ /ip hotspot user find where comment~"/$tyear" || comment~"/$lyear" ] do={:local comment [ /ip hotspot user get $i comment]; :local limit [ /ip hotspot user get $i limit-uptime]; :local name [ /ip hotspot user get $i name]; :local gettime [:pic $comment 12 20];:if ([:pic $comment 3] = "/" and [:pic $comment 6] = "/") do={:local expd [$dateint d=$comment] ;:local expt [$timeint t=$gettime] ;:if (($expd < $today and $expt < $curtime) or ($expd < $today and $expt > $curtime) or ($expd = $today and $expt < $curtime) and $limit != "00:00:01") do={ :if ([:pic $comment 21] = "N") do={[ /ip hotspot user set limit-uptime=1s $i ];[ /ip hotspot active remove [find where user=$name] ];} else={[ /ip hotspot user remove $i ];[ /ip hotspot active remove [find where user=$name] ];}}}}}`
      const result = await hotspot.setupExpireMonitor(script)
      console.log('Set expired monitor:', result)
      return { success: true, result: result.action, message: result.message }
    } catch (error) {
      console.error('Error setting expired monitor:', error)
      throw new Error('Failed to set expired monitor')
    }
  })