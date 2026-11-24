import { metaById } from '../meta';
import { GameShell } from '../../components/GameShell';
export default function AttritionGame() {
  const meta = metaById('attrition');
  return <GameShell title={meta.title} number={meta.number} accent={meta.accent} stages={[{ id: 'story', label: 'Story', render: () => <div className="card">Coming soon</div> }]} />;
}
